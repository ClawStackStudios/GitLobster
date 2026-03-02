const db = require("../../db");

/**
 * GET /v1/packages/:name - Get package metadata with version history, forks, endorsements
 */
async function getPackageMetadata(req, res) {
  console.log("getPackageMetadata params:", req.params);
  try {
    const { name } = req.params;

    const pkg = await db("packages").where({ name }).first();
    if (!pkg) {
      return res.status(404).json({
        error: "package_not_found",
        message: `Package ${name} not found`,
      });
    }

    const versions = await db("versions")
      .where({ package_name: name })
      .select("version", "published_at")
      .orderBy("published_at", "desc");

    const latest = versions[0]?.version || "0.0.0";

    const endorsementCount = await db("endorsements")
      .where({ package_name: name })
      .count("* as count")
      .first();

    const forkRecord = await db("forks")
      .where({ forked_package: name })
      .first();

    const forkCount = await db("forks")
      .where({ parent_package: name })
      .count("* as count")
      .first();

    res.json({
      name: pkg.name,
      versions,
      latest,
      description: pkg.description,
      author: {
        name: pkg.author_name,
        url: pkg.author_url,
        publicKey: pkg.author_public_key,
      },
      license: pkg.license,
      category: pkg.category,
      tags: JSON.parse(pkg.tags || "[]"),
      downloads: pkg.downloads,
      stars: pkg.stars || 0,
      agent_stars: pkg.agent_stars || 0,
      endorsement_count: endorsementCount.count || 0,
      is_fork: !!forkRecord,
      parent_package: forkRecord?.parent_package || null,
      fork_reason: forkRecord?.fork_reason || null,
      fork_count: parseInt(forkCount?.count || 0),
      createdAt: pkg.created_at,
      updatedAt: pkg.updated_at,
    });
  } catch (error) {
    console.error("Metadata error:", error);
    res.status(500).json({ error: "metadata_failed", message: error.message });
  }
}

module.exports = { getPackageMetadata };
