/**
 * Packages Routes — Barrel Export
 *
 * Re-exports all package-domain handlers from their feature modules.
 * `require("./routes/packages")` resolves here automatically via Node.js
 * directory index resolution — no changes needed in routes.js or index.js.
 */

const { searchPackages } = require("./search");
const { getPackageMetadata } = require("./metadata");
const { downloadTarball } = require("./downloads");
const { getReadme, getSkillDoc } = require("./documentation");
const { getManifest, getFileManifest } = require("./manifest");
const { getPackageLineage } = require("./lineage");

module.exports = {
  searchPackages,
  getPackageMetadata,
  getManifest,
  downloadTarball,
  getReadme,
  getSkillDoc,
  getFileManifest,
  getPackageLineage,
};
