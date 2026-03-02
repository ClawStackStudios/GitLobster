const db = require("../db");
const { getIdentityMetadata } = require("../identity");
const { getTrustScoreBreakdown } = require("../trust-score");

/**
 * GET /v1/agents - List all agents
 */
async function listAgents(req, res) {
  try {
    const agents = await db("agents").select("*").orderBy("name", "asc");

    const enhancedAgents = await Promise.all(
      agents.map(async (agent) => {
        const skillCount = await db("packages")
          .where({ author_name: agent.name })
          .count("* as count")
          .first();

        const trustScore = await getTrustScoreBreakdown(agent.name);

        return {
          ...agent,
          metadata: JSON.parse(agent.metadata || "{}"),
          skills_count: skillCount.count,
          trust_score: trustScore.computed_score,
        };
      }),
    );

    res.json(enhancedAgents);
  } catch (error) {
    console.error("List agents error:", error);
    res
      .status(500)
      .json({ error: "list_agents_failed", message: error.message });
  }
}

/**
 * GET /v1/agents/:name - Get enhanced agent profile
 */
async function getAgentProfile(req, res) {
  try {
    const { name } = req.params;
    const agent = await db("agents").where({ name }).first();

    if (!agent) {
      return res
        .status(404)
        .json({ error: "agent_not_found", message: "Agent not found" });
    }

    const rawSkills = await db("packages").where({ author_name: name });

    // Enhance skills with latest version and parsed tags
    const skills = await Promise.all(
      rawSkills.map(async (pkg) => {
        const latest = await db("versions")
          .where({ package_name: pkg.name })
          .orderBy("published_at", "desc")
          .first();

        return {
          ...pkg,
          tags:
            typeof pkg.tags === "string"
              ? JSON.parse(pkg.tags || "[]")
              : pkg.tags || [],
          latest_version: latest ? latest.version : "0.0.0",
        };
      }),
    );

    // Get identity metadata
    const identityMeta = await getIdentityMetadata(name);

    // Get trust score breakdown
    const trustScore = await getTrustScoreBreakdown(name);

    res.json({
      ...agent,
      metadata: JSON.parse(agent.metadata || "{}"),
      skills,
      identity: identityMeta,
      trustScore: {
        overall: trustScore.computed_score,
        components: {
          capabilityReliability: trustScore.capability_reliability,
          reviewConsistency: trustScore.review_consistency,
          flagHistory: trustScore.flag_history_score,
          trustAnchorOverlap: trustScore.trust_anchor_overlap,
          timeInNetwork: trustScore.time_in_network,
        },
        lastComputed: trustScore.last_computed,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "profile_failed", message: error.message });
  }
}

/**
 * GET /v1/agents/:name/manifest.json - Get agent profile manifest (machine-readable)
 */
async function getAgentManifest(req, res) {
  try {
    const { name } = req.params;
    const agent = await db("agents").where({ name }).first();

    if (!agent) {
      return res
        .status(404)
        .json({ error: "agent_not_found", message: "Agent not found" });
    }

    // Get identity metadata
    const identityMeta = await getIdentityMetadata(name);

    // Get trust score
    const trustScore = await getTrustScoreBreakdown(name);

    // Get skill count
    const skillCount = await db("packages")
      .where({ author_name: name })
      .count("* as count")
      .first();

    // Machine-readable manifest
    res.json({
      schema_version: "1.0",
      agent_name: name,
      identity: {
        public_key: identityMeta.fullPublicKey,
        key_fingerprint: identityMeta.keyFingerprint,
        key_age_days: identityMeta.keyAge,
        continuity_status: identityMeta.continuity,
        continuity_score: identityMeta.continuityScore,
      },
      trust_score: {
        overall: trustScore.computed_score,
        components: {
          capability_reliability: trustScore.capability_reliability,
          review_consistency: trustScore.review_consistency,
          flag_history: trustScore.flag_history_score,
          trust_anchor_overlap: trustScore.trust_anchor_overlap,
          time_in_network: trustScore.time_in_network,
        },
      },
      statistics: {
        skill_count: skillCount.count,
        joined_at: agent.joined_at,
      },
      trust_posture: determineTrustPosture(trustScore.computed_score),
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Manifest error:", error);
    res.status(500).json({ error: "manifest_failed", message: error.message });
  }
}

/**
 * Determine trust posture based on score
 */
function determineTrustPosture(score) {
  if (score >= 0.75) return "conservative"; // High trust, low risk
  if (score >= 0.5) return "balanced"; // Medium trust
  return "experimental"; // Low trust, high risk
}

/**
 * GET /v1/agent/skills - Get skills for the authenticated agent
 */
async function getAuthenticatedAgentSkills(req, res) {
  try {
    if (!req.auth?.payload?.sub) {
      return res.status(401).json({ error: "authentication_required" });
    }
    const agentName = req.auth.payload.sub;

    const rawSkills = await db("packages").where({ author_name: agentName });

    // Enhance skills with latest version and parsed tags
    const skills = await Promise.all(
      rawSkills.map(async (pkg) => {
        const latest = await db("versions")
          .where({ package_name: pkg.name })
          .orderBy("published_at", "desc")
          .first();

        return {
          ...pkg,
          tags:
            typeof pkg.tags === "string"
              ? JSON.parse(pkg.tags || "[]")
              : pkg.tags || [],
          latest_version: latest ? latest.version : "0.0.0",
        };
      }),
    );

    res.json(skills);
  } catch (error) {
    console.error("Authenticated skills error:", error);
    res
      .status(500)
      .json({ error: "agent_skills_failed", message: error.message });
  }
}

module.exports = {
  listAgents,
  getAgentProfile,
  getAgentManifest,
  getAuthenticatedAgentSkills,
};
