const fs = require("fs");
const path = require("path");

const GIT_PROJECT_ROOT =
  process.env.GITLOBSTER_STORAGE_DIR ||
  process.env.GIT_PROJECT_ROOT ||
  path.join(__dirname, "../../storage");
const COLLECTIVES_DIR = path.join(GIT_PROJECT_ROOT, "collectives");

/**
 * Ensures that the collectives directory exists.
 */
function ensureCollectivesDir() {
  if (!fs.existsSync(COLLECTIVES_DIR)) {
    fs.mkdirSync(COLLECTIVES_DIR, { recursive: true });
  }
}

// Initial check
ensureCollectivesDir();

/**
 * Helper to generate a safe filepath for a collective ID.
 * @param {string} id
 * @returns {string} Absolute path to the collective file.
 */
function getSafeFilePath(id) {
  // 1. Basic sanitization: whitelist allowed characters
  // We replace : with _ to maintain backward compatibility for valid dids
  let safeId = id.replace(/:/g, "_");

  // 2. Remove anything that isn't alphanumeric, underscore, dot or hyphen
  safeId = safeId.replace(/[^a-zA-Z0-9_\-\.]/g, "-");

  // 3. Prevent directory traversal (replace .. with --)
  while (safeId.includes("..")) {
    safeId = safeId.replace(/\.\./g, "--");
  }

  const filename = `${safeId}.json`;
  const resolvedBase = path.resolve(COLLECTIVES_DIR);
  const filepath = path.resolve(resolvedBase, filename);

  // 4. Final safety check: ensure the resolved path is still within COLLECTIVES_DIR
  if (!filepath.startsWith(resolvedBase)) {
    throw new Error("Invalid Collective ID: Path traversal detected");
  }

  return filepath;
}

/**
 * Create or update a Collective.
 * @param {Object} manifest - The collective.json object
 */
async function saveCollective(manifest) {
  ensureCollectivesDir();
  // Basic validation
  if (!manifest.id || !manifest.id.startsWith("did:gitlobster:collective:")) {
    throw new Error("Invalid Collective ID format");
  }
  if (!manifest.governance || !Array.isArray(manifest.governance.members)) {
    throw new Error("Invalid governance structure");
  }

  const filepath = getSafeFilePath(manifest.id);

  fs.writeFileSync(filepath, JSON.stringify(manifest, null, 2));
  return filepath;
}

/**
 * Retrieve a Collective by ID.
 */
async function getCollective(id) {
  ensureCollectivesDir();
  if (!id || typeof id !== "string") return null;

  let filepath;
  try {
    filepath = getSafeFilePath(id);
  } catch (err) {
    console.error(`Security Warning: Potential path traversal attempt with id "${id}"`);
    return null;
  }

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

  return member ? { role: member.role, weight: member.weight || 1 } : null;
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
