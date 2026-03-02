const db = require("../../db");

/**
 * GET /v1/packages/:name/lineage - Get package fork lineage (ancestors + descendants)
 */
async function getPackageLineage(req, res) {
  const { name } = req.params;
  const { direction = "both", depth = 5 } = req.query;

  try {
    const pkg = await db("packages").where({ name }).first();
    if (!pkg) {
      return res.status(404).json({ error: "package_not_found" });
    }

    // --- Ancestors ---
    let ancestors = [];
    const forkRecord = await db("forks")
      .where({ forked_package: name })
      .first();
    if (forkRecord) {
      const parentPkg = await db("packages")
        .where({ name: forkRecord.parent_package })
        .first();
      ancestors = [
        {
          package: forkRecord.parent_package,
          forkPointVersion: forkRecord.fork_point_version || "1.0.0",
          signatureValid: !!forkRecord.signature,
          author: parentPkg
            ? { fingerprint: parentPkg.author_public_key?.slice(0, 12) || null }
            : null,
        },
      ];
    }

    // --- Descendants ---
    const forks = await db("forks")
      .where({ parent_package: name })
      .limit(parseInt(depth));

    // Batch fetch forked package details to avoid N+1
    const forkedPackageNames = forks.map((f) => f.forked_package);
    const forkedPkgs =
      forkedPackageNames.length > 0
        ? await db("packages").whereIn("name", forkedPackageNames)
        : [];

    const forkedPkgsMap = new Map(forkedPkgs.map((p) => [p.name, p]));

    const descendants = forks.map((fork) => {
      const forkedPkg = forkedPkgsMap.get(fork.forked_package);
      return {
        package: fork.forked_package,
        forkReason: fork.fork_reason,
        forkerAgent: fork.forker_agent,
        signatureValid: !!fork.signature,
        signatureStatus: fork.signature ? "verified" : "unverified",
        author: forkedPkg?.author_public_key
          ? { fingerprint: forkedPkg.author_public_key.slice(0, 12) }
          : null,
      };
    });

    res.json({
      package: {
        name: pkg.name,
        uuid: pkg.uuid || null,
        is_fork: !!forkRecord,
      },
      fork_badge: forkRecord
        ? {
            forked_from_name: forkRecord.parent_package,
            forked_from_uuid: forkRecord.parent_uuid || null,
            fork_point_version: forkRecord.fork_point_version,
            fork_point_commit: forkRecord.fork_point_commit,
            forked_at: forkRecord.forked_at,
            display: `🍴 Forked from ${forkRecord.parent_package} (v${forkRecord.fork_point_version})`,
          }
        : null,
      author: {
        name: pkg.author_name,
        publicKey: pkg.author_public_key,
        fingerprint: pkg.author_public_key
          ? pkg.author_public_key.slice(0, 12)
          : null,
      },
      ancestors,
      descendants,
      trust: {
        totalForks: descendants.length,
        verifiedSignatures: descendants.filter((d) => d.signatureValid).length,
      },
    });
  } catch (error) {
    console.error("Lineage error:", error);
    res.status(500).json({ error: "lineage_failed", message: error.message });
  }
}

module.exports = { getPackageLineage };
