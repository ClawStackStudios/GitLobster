const db = require("../../db");

/**
 * GET /v1/packages - Search packages with query, category, and tag filters
 */
async function searchPackages(req, res) {
  try {
    const { q, category, tag } = req.query;
    // SECURITY: Cap pagination to prevent DoS via unbounded queries
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = Math.min(
      10000,
      Math.max(0, parseInt(req.query.offset) || 0),
    );

    let query = db("packages").select("*");

    if (q) {
      query = query.where(function () {
        this.where("name", "like", `%${q}%`).orWhere(
          "description",
          "like",
          `%${q}%`,
        );
      });
    } else {
      // Hide system skills from default listing
      query = query.where("name", "!=", "gitlobster-sync");
    }

    if (category) query = query.where("category", category);
    if (tag) query = query.whereRaw("tags LIKE ?", [`%"${tag}"%`]);

    const total = await query.clone().count("* as count").first();
    const results = await query.limit(limit).offset(offset);

    const formatted = results.map((pkg) => ({
      ...pkg,
      tags: JSON.parse(pkg.tags || "[]"),
    }));

    res.json({ results: formatted, total: total.count, limit, offset });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "search_failed", message: error.message });
  }
}

module.exports = { searchPackages };
