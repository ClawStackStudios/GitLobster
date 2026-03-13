const fs = require("fs");
const path = require("path");

const GIT_PROJECT_ROOT =
  process.env.GITLOBSTER_STORAGE_DIR ||
  process.env.GIT_PROJECT_ROOT ||
  path.join(__dirname, "../../storage");
const COLLECTIVES_DIR = path.join(GIT_PROJECT_ROOT, "collectives");

// Ensure storage exists
if (!fs.existsSync(COLLECTIVES_DIR)) {
  fs.mkdirSync(COLLECTIVES_DIR, { recursive: true });
}

/**
 * Create or update a Collective.
 * @param {Object} manifest - The collective.json object
 */
async function saveCollective(manifest) {
  // Basic validation
  if (!manifest.id || !manifest.id.startsWith("did:gitlobster:collective:")) {
    throw new Error("Invalid Collective ID format");
  }
  if (!manifest.governance || !Array.isArray(manifest.governance.members)) {
    throw new Error("Invalid governance structure");
  }

  const filename = `${manifest.id.replace(/:/g, "_")}.json`;
  const filepath = path.join(COLLECTIVES_DIR, filename);

  fs.writeFileSync(filepath, JSON.stringify(manifest, null, 2));
  return filepath;
}

/**
 * Retrieve a Collective by ID.
 */
async function getCollective(id) {
  const filename = `${id.replace(/:/g, "_")}.json`;
  const filepath = path.join(COLLECTIVES_DIR, filename);

  if (!fs.existsSync(filepath)) return null;

  const content = fs.readFileSync(filepath, "utf8");
  return JSON.parse(content);
}

/**
 * Check if an agent is a member of a collective, and return their role.
 * @param {string} collectiveId
 * @param {string} agentId
 * @returns {Object|null} { role: string, weight: number } or null
 */
async function getMembership(collectiveId, agentId) {
  const collective = await getCollective(collectiveId);
  if (!collective) return null;

  // Normalize IDs (simple string match for MVP)
  const member = collective.governance.members.find((m) => m.id === agentId);

  return member ? { role: member.role, weight: member.weight ?? 1 } : null;
}

/**
 * Check if a set of endorsers meets the collective's threshold.
 * @param {string} collectiveId
 * @param {Array<string>} endorserAgentIds - IDs of agents who endorsed
 * @returns {boolean}
 */
async function verifyGovernanceThreshold(collectiveId, endorserAgentIds) {
  const collective = await getCollective(collectiveId);
  if (!collective) return false;

  const threshold = collective.governance.threshold || 1;
  let currentWeight = 0;
  const uniqueSigners = new Set(endorserAgentIds);

  for (const agentId of uniqueSigners) {
    const membership = await getMembership(collectiveId, agentId);
    if (membership) {
      currentWeight += membership.weight;
    }
  }

  return currentWeight >= threshold;
}

module.exports = {
  saveCollective,
  getCollective,
  getMembership,
  verifyGovernanceThreshold,
};
