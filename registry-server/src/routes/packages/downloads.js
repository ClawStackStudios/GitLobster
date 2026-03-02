const fs = require("fs").promises;
const path = require("path");
const db = require("../../db");

const STORAGE_DIR =
  process.env.GITLOBSTER_STORAGE_DIR ||
  path.join(__dirname, "../../../../storage");

/**
 * GET /v1/packages/:name/:version/tarball - Download package tarball
 */
async function downloadTarball(req, res) {
  try {
    let { name, version } = req.params;

    // Resolve "latest" to actual version
    if (version === "latest") {
      const latestVersion = await db("versions")
        .where({ package_name: name })
        .orderBy("published_at", "desc")
        .first();

      if (!latestVersion) {
        return res.status(404).json({
          error: "package_not_found",
          message: `Package ${name} has no published versions`,
        });
      }
      version = latestVersion.version;
    }

    const versionData = await db("versions")
      .where({ package_name: name, version })
      .first();

    if (!versionData) {
      return res.status(404).json({
        error: "version_not_found",
        message: `Version ${version} of ${name} not found`,
      });
    }

    const tarballPath = path.join(STORAGE_DIR, versionData.storage_path);

    try {
      await fs.access(tarballPath);
    } catch {
      return res.status(500).json({
        error: "file_not_found",
        message: "Package file missing from storage",
      });
    }

    // Increment download counter
    await db("packages").where({ name }).increment("downloads", 1);

    const filename = `${name.replace(/[@\/]/g, "-")}-${version}.tgz`;
    res.setHeader("Content-Type", "application/gzip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("X-Package-Hash", versionData.hash);
    res.setHeader("X-Package-Signature", versionData.signature);

    // Stream file to response
    require("fs").createReadStream(tarballPath).pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "download_failed", message: error.message });
  }
}

module.exports = { downloadTarball };
