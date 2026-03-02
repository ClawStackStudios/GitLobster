#!/usr/bin/env node

/**
 * Git Post-Receive Hook for GitLobster
 *
 * This hook is triggered after a successful git push. It:
 * 1. Reads the pushed commit information from stdin
 * 2. Gets the gitlobster.json manifest from the commit
 * 3. Reads README.md and parses YAML frontmatter
 * 4. Validates manifest.name === frontmatter.title
 * 5. Updates the database if valid, rejects push if invalid
 *
 * Input format (from git): oldrev newrev refname
 * Example: 0000000000000000000000000000000000000000 abc123def456 refs/heads/main
 */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration - paths relative to registry-server
const REGISTRY_SERVER_DIR = path.resolve(__dirname, "../..");
const DB_PATH = process.env.GIT_PROJECT_ROOT
  ? path.resolve(process.env.GIT_PROJECT_ROOT, "../registry.sqlite")
  : path.resolve(REGISTRY_SERVER_DIR, "../storage/registry.sqlite");

/**
 * Parse YAML frontmatter from README.md
 * Frontmatter format:
 * ---
 * title: Package Name
 * description: Some description
 * ---
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return null;
  }

  const frontmatterContent = match[1];
  const frontmatter = {};

  frontmatterContent.split("\n").forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      frontmatter[key] = value;
    }
  });

  return frontmatter;
}

/**
 * Get file content from a specific commit
 * SECURITY: Uses execFileSync with argument array to prevent command injection
 */
function getFileFromCommit(commitHash, filePath) {
  try {
    const content = execFileSync("git", ["show", `${commitHash}:${filePath}`], {
      encoding: "utf8",
      cwd: process.env.GIT_DIR || process.cwd(),
    });
    return content;
  } catch (err) {
    console.error(
      `[POST-RECEIVE] Failed to get ${filePath} from commit ${commitHash}: ${err.message}`,
    );
    return null;
  }
}

/**
 * Get commit author information
 * SECURITY: Uses execFileSync with argument array to prevent command injection
 */
function getCommitAuthor(commitHash) {
  try {
    const output = execFileSync(
      "git",
      ["log", "-1", "--format=%an|%ae", commitHash],
      {
        encoding: "utf8",
        cwd: process.env.GIT_DIR || process.cwd(),
      },
    ).trim();

    const [author_name, author_email] = output.split("|");
    return { author_name, author_email };
  } catch (err) {
    console.error(
      `[POST-RECEIVE] Failed to get author for commit ${commitHash}: ${err.message}`,
    );
    return { author_name: "unknown", author_email: "unknown" };
  }
}

/**
 * Convert scoped package name to directory-safe name
 * @scope/name -> scope-name.git
 */
function scopedToDirName(name) {
  return name.replace(/^@/, "").replace("/", "-") + ".git";
}

/**
 * Database operations (using knex if available, fallback to sqlite3)
 */
async function updateDatabase(manifest, commitHash, author) {
  const knex = require("knex");

  const db = knex({
    client: "sqlite3",
    connection: {
      filename: DB_PATH,
    },
    useNullAsDefault: true,
  });

  try {
    const packageName = manifest.name;
    const version = manifest.version;

    console.log(
      `[POST-RECEIVE] Updating database for ${packageName}@${version}`,
    );
    console.log(`[POST-RECEIVE] Commit: ${commitHash}`);
    console.log(
      `[POST-RECEIVE] Author: ${author.author_name} <${author.author_email}>`,
    );

    // Check if package exists
    let pkg = await db("packages").where({ name: packageName }).first();

    if (!pkg) {
      // Create new package entry
      console.log(`[POST-RECEIVE] Creating new package: ${packageName}`);
      await db("packages").insert({
        name: packageName,
        description: manifest.description || "",
        author_name: author.author_name,
        author_url: manifest.homepage || "",
        author_public_key: "",
        license: manifest.license || "",
        category: "",
        tags: JSON.stringify([]),
        downloads: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      pkg = await db("packages").where({ name: packageName }).first();
    } else {
      // Update existing package
      await db("packages")
        .where({ name: packageName })
        .update({
          description: manifest.description || pkg.description,
          updated_at: new Date().toISOString(),
        });
    }

    // Insert or update version
    const existingVersion = await db("versions")
      .where({ package_name: packageName, version })
      .first();

    if (existingVersion) {
      console.log(`[POST-RECEIVE] Updating existing version ${version}`);
      await db("versions")
        .where({ package_name: packageName, version })
        .update({
          commit_hash: commitHash,
          author_name: author.author_name,
          author_email: author.author_email,
          manifest: JSON.stringify(manifest),
        });
    } else {
      console.log(`[POST-RECEIVE] Creating new version ${version}`);
      const versionId = await db("versions").insert({
        package_name: packageName,
        version: version,
        storage_path: "", // Will be filled by storage hook
        hash: "", // Will be filled by storage hook
        signature: "", // Will be filled by storage hook
        manifest: JSON.stringify(manifest),
        commit_hash: commitHash,
        author_name: author.author_name,
        author_email: author.author_email,
        published_at: new Date().toISOString(),
      });

      // Update latest_version_id in packages
      await db("packages").where({ name: packageName }).update({
        latest_version_id: versionId[0],
      });
    }

    console.log(
      `[POST-RECEIVE] ✅ Database updated successfully for ${packageName}@${version}`,
    );

    // Generate tarball from the pushed commit so the download API works
    await generateTarball(packageName, version, commitHash, db);
  } catch (err) {
    console.error(`[POST-RECEIVE] ❌ Database error: ${err.message}`);
    throw err;
  } finally {
    await db.destroy();
  }
}

/**
 * Generate a .tgz tarball from a git commit using git-archive.
 * Updates the versions row with the correct storage_path and hash.
 * SECURITY: Uses execFileSync with argument arrays.
 */
async function generateTarball(packageName, version, commitHash, db) {
  const crypto = require("crypto");

  const STORAGE_DIR = process.env.GITLOBSTER_STORAGE_DIR
    ? path.resolve(process.env.GITLOBSTER_STORAGE_DIR)
    : path.resolve(REGISTRY_SERVER_DIR, "storage");

  const packageDir = path.join(STORAGE_DIR, "packages", packageName);
  fs.mkdirSync(packageDir, { recursive: true });

  const tarballPath = path.join(packageDir, `${version}.tgz`);
  const gitDir = process.env.GIT_DIR || process.cwd();

  try {
    // git archive --format=tar.gz --prefix=package/ -o <dest> <commit>
    execFileSync(
      "git",
      [
        "archive",
        "--format=tar.gz",
        `--prefix=package/`,
        "-o",
        tarballPath,
        commitHash,
      ],
      { cwd: gitDir },
    );

    // Calculate SHA-256 hash of the generated tarball
    const tarballBuffer = fs.readFileSync(tarballPath);
    const hash = `sha256:${crypto.createHash("sha256").update(tarballBuffer).digest("hex")}`;
    const relativePath = path.relative(STORAGE_DIR, tarballPath);

    // Update the database row
    await db("versions").where({ package_name: packageName, version }).update({
      storage_path: relativePath,
      hash: hash,
    });

    console.log(
      `[POST-RECEIVE] ✅ Tarball generated: ${relativePath} (${hash})`,
    );
  } catch (err) {
    console.error(
      `[POST-RECEIVE] ⚠️ Tarball generation failed: ${err.message}`,
    );
    // Non-fatal: the version record will still exist, but tarball download won't work
  }
}

/**
 * Main hook execution
 */
function main() {
  console.log("[POST-RECEIVE] Hook started");

  // Read stdin for git push information
  let stdinData = "";
  try {
    stdinData = fs.readFileSync("/dev/stdin", "utf8").trim();
  } catch (err) {
    console.error("[POST-RECEIVE] Failed to read stdin:", err.message);
    process.exit(1);
  }

  if (!stdinData) {
    console.log("[POST-RECEIVE] No data received, exiting");
    process.exit(0);
  }

  // Parse the input: oldrev newrev refname
  const parts = stdinData.split(" ");
  if (parts.length < 3) {
    console.error("[POST-RECEIVE] Invalid input format");
    process.exit(1);
  }

  const oldRev = parts[0];
  const newRev = parts[1];
  const refName = parts[2];

  // SECURITY: Validate commit hash format to prevent injection
  if (!/^[0-9a-f]{40,64}$/.test(newRev)) {
    console.error(`[POST-RECEIVE] ❌ Invalid commit hash format: ${newRev}`);
    process.exit(1);
  }

  console.log(
    `[POST-RECEIVE] Push: ${oldRev.substring(0, 7)} -> ${newRev.substring(0, 7)} (${refName})`,
  );

  // Only process refs/heads (branch pushes)
  if (!refName.startsWith("refs/heads/")) {
    console.log("[POST-RECEIVE] Not a branch push, skipping");
    process.exit(0);
  }

  // Skip if this is a branch deletion (newRev is all zeros)
  if (newRev.match(/^0+$/)) {
    console.log("[POST-RECEIVE] Branch deletion, skipping validation");
    process.exit(0);
  }

  // Get the commit hash (newRev is the pushed commit)
  const commitHash = newRev;

  // Get gitlobster.json from the commit
  console.log(
    `[POST-RECEIVE] Reading gitlobster.json from commit ${commitHash}`,
  );
  const manifestContent = getFileFromCommit(commitHash, "gitlobster.json");

  if (!manifestContent) {
    console.error("[POST-RECEIVE] ❌ gitlobster.json not found in commit");
    process.exit(1);
  }

  // Parse the manifest
  let manifest;
  try {
    manifest = JSON.parse(manifestContent);
  } catch (err) {
    console.error(
      "[POST-RECEIVE] ❌ Failed to parse gitlobster.json:",
      err.message,
    );
    process.exit(1);
  }

  // Validate required fields in manifest
  if (!manifest.name || !manifest.version) {
    console.error(
      "[POST-RECEIVE] ❌ Manifest missing required fields (name, version)",
    );
    process.exit(1);
  }

  // Get README.md and parse frontmatter
  console.log(`[POST-RECEIVE] Reading README.md from commit ${commitHash}`);
  const readmeContent = getFileFromCommit(commitHash, "README.md");

  if (!readmeContent) {
    console.error("[POST-RECEIVE] ❌ README.md not found in commit");
    process.exit(1);
  }

  const frontmatter = parseFrontmatter(readmeContent);

  if (!frontmatter || !frontmatter.title) {
    console.error(
      "[POST-RECEIVE] ❌ README.md missing YAML frontmatter with title",
    );
    process.exit(1);
  }

  // Validate: manifest.name === frontmatter.title
  console.log(
    `[POST-RECEIVE] Validating: manifest.name="${manifest.name}" vs frontmatter.title="${frontmatter.title}"`,
  );

  if (manifest.name !== frontmatter.title) {
    console.error("[POST-RECEIVE] ❌ Metadata mismatch!");
    console.error(
      `[POST-RECEIVE]    manifest.name (${manifest.name}) !== frontmatter.title (${frontmatter.title})`,
    );
    process.exit(1); // Reject push
  }

  // Get author information
  const author = getCommitAuthor(commitHash);
  console.log(
    `[POST-RECEIVE] Author: ${author.author_name} <${author.author_email}>`,
  );

  // Update database
  try {
    // Dependencies are guaranteed by package.json — no dynamic installs

    // Run async database update
    updateDatabase(manifest, commitHash, author)
      .then(() => {
        console.log(
          "[POST-RECEIVE] ✅ Push validated and processed successfully",
        );
        process.exit(0);
      })
      .catch((err) => {
        console.error("[POST-RECEIVE] ❌ Database update failed:", err.message);
        process.exit(1);
      });
  } catch (err) {
    console.error("[POST-RECEIVE] ❌ Error:", err.message);
    process.exit(1);
  }
}

// Run the hook
main();
