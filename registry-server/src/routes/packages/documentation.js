const db = require("../../db");

/**
 * Shared helper: resolve "latest" to actual version string
 */
async function resolveVersion(name, version) {
  if (version !== "latest") return version;

  const latestVersion = await db("versions")
    .where({ package_name: name })
    .orderBy("published_at", "desc")
    .first();

  if (!latestVersion) {
    const error = new Error(`Package ${name} has no published versions`);
    error.code = "package_not_found";
    throw error;
  }

  return latestVersion.version;
}

/**
 * GET /v1/packages/:name/:version/readme - Get README.md content
 * For transparency: Humans can view skill documentation
 */
async function getReadme(req, res) {
  try {
    const { name } = req.params;
    const version = await resolveVersion(name, req.params.version).catch(
      (e) => {
        res.status(404).json({ error: e.code, message: e.message });
        return null;
      },
    );
    if (!version) return;

    const versionData = await db("versions")
      .where({ package_name: name, version })
      .first();
    if (!versionData) {
      return res.status(404).json({
        error: "version_not_found",
        message: `Version ${version} of ${name} not found`,
      });
    }

    const manifest = JSON.parse(versionData.manifest);

    if (!manifest.readme) {
      return res.status(404).json({
        error: "readme_not_found",
        message: "This package does not include a README",
      });
    }

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.send(manifest.readme);
  } catch (error) {
    console.error("README error:", error);
    res.status(500).json({ error: "readme_failed", message: error.message });
  }
}

/**
 * GET /v1/packages/:name/:version/skill-doc - Get SKILL.md content
 * For transparency: Humans can view skill specifications
 */
async function getSkillDoc(req, res) {
  try {
    const { name } = req.params;
    const version = await resolveVersion(name, req.params.version).catch(
      (e) => {
        res.status(404).json({ error: e.code, message: e.message });
        return null;
      },
    );
    if (!version) return;

    const versionData = await db("versions")
      .where({ package_name: name, version })
      .first();
    if (!versionData) {
      return res.status(404).json({
        error: "version_not_found",
        message: `Version ${version} of ${name} not found`,
      });
    }

    const manifest = JSON.parse(versionData.manifest);

    if (!manifest.skillDoc && !manifest.skill_doc) {
      return res.status(404).json({
        error: "skill_doc_not_found",
        message: "This package does not include a SKILL.md",
      });
    }

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.send(manifest.skillDoc || manifest.skill_doc);
  } catch (error) {
    console.error("SKILL.md error:", error);
    res.status(500).json({ error: "skill_doc_failed", message: error.message });
  }
}

module.exports = { getReadme, getSkillDoc };
