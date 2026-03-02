const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * GIT_STORAGE_LOCATION Configuration
 *
 * LOCAL: Store git repos in container volume (default - for public registries)
 * SERVER: Store git repos on external path (for LAN/SOHO cloud features)
 *
 * When SERVER is selected, GITLOBSTER_SERVER_STORAGE_PATH must be set.
 */

const storageLocation = process.env.GIT_STORAGE_LOCATION || "LOCAL";

let GIT_PROJECT_ROOT;

if (storageLocation === "SERVER") {
  const serverPath = process.env.GITLOBSTER_SERVER_STORAGE_PATH;
  if (!serverPath) {
    throw new Error(
      "GIT_STORAGE_LOCATION=SERVER requires GITLOBSTER_SERVER_STORAGE_PATH to be set",
    );
  }
  GIT_PROJECT_ROOT = path.resolve(serverPath, "git");
  console.log(`[GIT-MIDDLEWARE] Using SERVER storage: ${GIT_PROJECT_ROOT}`);
} else {
  // LOCAL - default behavior
  // LOCAL - default behavior
  // Fallback to legacy GITLOBSTER_STORAGE_DIR for backwards compatibility
  GIT_PROJECT_ROOT = process.env.GITLOBSTER_STORAGE_DIR
    ? path.resolve(process.env.GITLOBSTER_STORAGE_DIR, "git")
    : path.resolve(__dirname, "../storage/git");
  console.log(`[GIT-MIDDLEWARE] Using LOCAL storage: ${GIT_PROJECT_ROOT}`);
}

// Path to the post-receive hook source
const POST_RECEIVE_HOOK_SOURCE = path.resolve(
  __dirname,
  "../scripts/git-hooks/post-receive.js",
);

// Git template directory for auto-installing hooks on new repos
const GIT_TEMPLATE_DIR = path.resolve(__dirname, "../storage/git-template");

/**
 * Initialize the git template directory with hooks.
 * This ensures new bare repos automatically get the post-receive hook.
 */
function initializeGitTemplate() {
  const hooksDir = path.join(GIT_TEMPLATE_DIR, "hooks");
  const hookDest = path.join(hooksDir, "post-receive");

  // Create template directory structure
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  // Copy the post-receive hook to template
  if (fs.existsSync(POST_RECEIVE_HOOK_SOURCE)) {
    fs.copyFileSync(POST_RECEIVE_HOOK_SOURCE, hookDest);
    fs.chmodSync(hookDest, 0o755);
    console.log(
      "[GIT-MIDDLEWARE] Initialized git template with post-receive hook",
    );
  } else {
    console.warn(
      "[GIT-MIDDLEWARE] Warning: post-receive hook source not found at",
      POST_RECEIVE_HOOK_SOURCE,
    );
  }
}

// Ensure git storage directory exists
if (!fs.existsSync(GIT_PROJECT_ROOT)) {
  fs.mkdirSync(GIT_PROJECT_ROOT, { recursive: true });
}

// Initialize git template directory
initializeGitTemplate();

/**
 * Convert scoped package name to directory-safe name
 * @scope/name -> scope-name.git
 */
function scopedToDirName(name) {
  // Security: Whitelist allowed characters to prevent directory traversal and command injection
  // 1. Remove leading @
  let safeName = name.replace(/^@/, "");

  // 2. Replace all slashes with hyphens
  safeName = safeName.replace(/\//g, "-");

  // 3. Replace any unsafe characters (not alphanumeric, dot, underscore, hyphen) with hyphen
  safeName = safeName.replace(/[^a-zA-Z0-9_\-\.]/g, "-");

  // 4. Prevent directory traversal (replace .. with --)
  while (safeName.includes("..")) {
    safeName = safeName.replace(/\.\./g, "--");
  }

  // 5. SECURITY: Reject names that have no alphanumeric characters after sanitization
  if (!/[a-zA-Z0-9]/.test(safeName)) {
    throw new Error(
      `Invalid package name: no valid characters remaining after sanitization`,
    );
  }

  return safeName.endsWith(".git") ? safeName : safeName + ".git";
}

/**
 * Convert directory-safe name back to scoped package name
 * scope-name.git -> @scope/name
 */
function dirNameToScoped(name) {
  if (name.endsWith(".git")) {
    const base = name.slice(0, -4);
    // Check if it looks like a scoped package (contains -)
    if (base.includes("-")) {
      const parts = base.split(/-/);
      if (parts.length >= 2) {
        return "@" + parts[0] + "/" + parts.slice(1).join("/");
      }
    }
  }
  return name;
}

const gitMiddleware = (req, res, next) => {
  // Handle requests with /git/... prefix or direct .git access
  // Pattern: /git/:repo.git/* or /git/:repo.git or /:repo.git/*
  const gitRegex =
    /^\/git\/([a-zA-Z0-9_\-@\.\/]+\.git)(.*)$|^\/([a-zA-Z0-9_\-@\.\/]+\.git)(.*)$/;
  const match = req.url.match(gitRegex);

  if (!match) return next();

  // Determine which group matched
  const repoName = match[1] || match[3];
  const pathInfo = (match[2] || match[4] || "/").replace(/^\/+/, "");

  // Security: Prevent directory traversal
  if (repoName.includes("..") || pathInfo.includes("..")) {
    return res.status(403).send("Forbidden");
  }

  // Convert scoped package names to directory-safe names
  let dirName;
  try {
    dirName = scopedToDirName(repoName);
  } catch (err) {
    return res.status(400).send("Bad Request: Invalid repository name");
  }
  const repoPath = path.join(GIT_PROJECT_ROOT, dirName);

  // Auto-Provisioning on Git Push
  // If the agent attempts a git push (service=git-receive-pack) and the repo doesn't exist, create it.
  const isPushRequest =
    req.query.service === "git-receive-pack" ||
    req.url.endsWith("/git-receive-pack");

  if (isPushRequest && !fs.existsSync(repoPath)) {
    console.log(
      `[GIT-MIDDLEWARE] Auto-provisioning new repository: ${dirName}`,
    );
    try {
      // 1. Create the container directory
      fs.mkdirSync(repoPath, { recursive: true });

      // 2. Initialize it as a bare git repository
      const { execFileSync } = require("child_process");
      execFileSync("git", ["init", "--bare"], {
        cwd: repoPath,
        stdio: "ignore",
      });

      // 3. Attach the gitlobster post-receive hook from the template
      const hooksDestDir = path.join(repoPath, "hooks");
      const postReceiveSource = path.join(
        GIT_TEMPLATE_DIR,
        "hooks",
        "post-receive",
      );
      const postReceiveDest = path.join(hooksDestDir, "post-receive");

      if (!fs.existsSync(hooksDestDir)) {
        fs.mkdirSync(hooksDestDir, { recursive: true });
      }

      if (fs.existsSync(postReceiveSource)) {
        fs.copyFileSync(postReceiveSource, postReceiveDest);
        fs.chmodSync(postReceiveDest, 0o755);
      } else {
        console.warn(
          `[GIT-MIDDLEWARE] Initialized ${dirName} but could not find template hook to copy.`,
        );
      }
    } catch (err) {
      console.error(
        `[GIT-MIDDLEWARE] Failed to auto-provision ${dirName}:`,
        err,
      );
      // Give git unbuffered stderr, then 500
      return res.status(500).send("Failed to provision git repository");
    }
  }

  const env = {
    ...process.env,
    GIT_PROJECT_ROOT: GIT_PROJECT_ROOT,
    GIT_HTTP_EXPORT_ALL: "1",
    GIT_TEMPLATE_DIR: GIT_TEMPLATE_DIR, // Auto-install hooks on new repos
    PATH_INFO: `/${dirName}/${pathInfo.split("?")[0]}`,
    REMOTE_USER: req.user ? req.user.id : "anonymous",
    REMOTE_ADDR: req.ip,
    CONTENT_TYPE: req.headers["content-type"],
    QUERY_STRING: req.query ? new URLSearchParams(req.query).toString() : "",
    REQUEST_METHOD: req.method,
  };

  console.log(
    `[GIT] ${req.method} ${req.url} -> Spawning git http-backend (repo: ${dirName})`,
  );

  const git = spawn("git", ["http-backend"], {
    env,
    cwd: GIT_PROJECT_ROOT,
  });

  // Pipe request body to git stdin (for POST git-receive-pack)
  req.pipe(git.stdin);

  let headersSent = false;
  let buffer = Buffer.alloc(0);

  git.stdout.on("data", (chunk) => {
    if (headersSent) {
      res.write(chunk);
      return;
    }

    buffer = Buffer.concat([buffer, chunk]);

    // Find double newline which separates headers from body
    const headerEnd = buffer.indexOf("\r\n\r\n");
    if (headerEnd !== -1) {
      const headerString = buffer.slice(0, headerEnd).toString("utf8");
      const body = buffer.slice(headerEnd + 4);

      // Parse headers
      const lines = headerString.split("\r\n");
      lines.forEach((line) => {
        const [key, value] = line.split(": ");
        if (key && value) {
          if (key.toLowerCase() === "status") {
            res.status(parseInt(value.split(" ")[0]));
          } else {
            res.setHeader(key, value);
          }
        }
      });

      headersSent = true;
      res.write(body);
    } else {
      // Edge case: Header boundary might be split across chunks.
      if (buffer.length > 10 * 1024) {
        console.error("[GIT] Header buffer overflow");
        git.kill();
        res.status(500).send("Internal Server Error");
      }
    }
  });

  git.stdout.on("end", () => {
    if (headersSent) {
      res.end();
    }
  });

  git.stderr.on("data", (data) => {
    console.error(`[GIT-STDERR] ${data}`);
  });

  git.on("close", (code) => {
    if (!headersSent) {
      if (!res.headersSent) {
        res.status(500).send("Git process exited unexpectedly");
      }
    }
    console.log(`[GIT] Exited with code ${code}`);
  });
};

module.exports = gitMiddleware;
module.exports.scopedToDirName = scopedToDirName;
module.exports.dirNameToScoped = dirNameToScoped;
module.exports.GIT_PROJECT_ROOT = GIT_PROJECT_ROOT;
