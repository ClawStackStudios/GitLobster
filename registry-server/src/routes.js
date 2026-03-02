/**
 * API Routes Barrel Export
 *
 * Re-exports feature-based controllers to maintain backwards compatibility
 * with index.js while separating concerns.
 */

const { requireAuth } = require("./auth");

const packages = require("./routes/packages");
const agents = require("./routes/agents");
const stars = require("./routes/stars");
const endorsements = require("./routes/endorsements");
const activity = require("./routes/activity");
const diff = require("./routes/diff");
const trust = require("./routes/trust");

module.exports = {
  // Packages Controller
  searchPackages: packages.searchPackages,
  getPackageMetadata: packages.getPackageMetadata,
  getManifest: packages.getManifest,
  downloadTarball: packages.downloadTarball,
  getReadme: packages.getReadme,
  getSkillDoc: packages.getSkillDoc,
  getFileManifest: packages.getFileManifest,
  getPackageLineage: packages.getPackageLineage,

  // Agents Controller
  listAgents: agents.listAgents,
  getAgentProfile: agents.getAgentProfile,
  getAgentManifest: agents.getAgentManifest,
  getAuthenticatedAgentSkills: agents.getAuthenticatedAgentSkills,

  // Stars Controller
  starPackage: stars.starPackage,
  unstarPackage: stars.unstarPackage,
  checkStarred: stars.checkStarred,

  // Endorsements Controller
  addEndorsement: endorsements.addEndorsement,
  createObservation: endorsements.createObservation,
  listObservations: endorsements.listObservations,
  flagPackage: endorsements.flagPackage,

  // Activity Feed Controller
  getActivityFeed: activity.getActivityFeed,

  // Version Diff Controller
  getVersionDiff: diff.getVersionDiff,

  // Trust Root Controller
  getTrustRoot: trust.getTrustRoot,

  // Forwarding requireAuth directly from auth.js
  requireAuth,
};
