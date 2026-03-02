require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const fs = require("fs");
const path = require("path");
const routes = require("./routes");
const gitMiddleware = require("./git-middleware");

// Initialize node identity on startup
const KeyManager = require("./trust/KeyManager");
KeyManager.initNodeIdentity();

const app = express();
const PORT = process.env.PORT || 3000;

// Storage Config
const STORAGE_DIR = process.env.GITLOBSTER_STORAGE_DIR
  ? path.resolve(process.env.GITLOBSTER_STORAGE_DIR)
  : path.join(__dirname, "../storage");

if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

// Middleware
// Git Smart HTTP Protocol (Must be before body parsers)
app.use(gitMiddleware);

app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for CDN scripts in MVP
  }),
);
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "50mb" })); // Increased limit for base64 tarballs

// Serve UI
// Serve UI (Vite Build)
app.use(express.static(path.join(__dirname, "../dist")));

// Serve Documentation (Markdown)
app.use("/v1/docs", express.static(path.join(__dirname, "../docs")));

// Health check
app.get("/health", (req, res) => {
  res.json({
    service: process.env.GITLOBSTER_REGISTRY_NAME || "GitLobster Registry",
    version: "0.1.0",
    status: "online",
    protocol: "Agent Git Registry Protocol v0.1.0",
    docs: "https://github.com/acidgreenservers/gitlobster/tree/main/specs",
  });
});

// API Routes - Packages
app.get("/v1/packages", routes.searchPackages);
app.get("/v1/packages/:name/lineage", routes.getPackageLineage);
app.get("/v1/packages/:name", routes.getPackageMetadata);
app.get("/v1/packages/:name/:version/manifest", routes.getManifest);
app.get("/v1/packages/:name/:version/tarball", routes.downloadTarball);
app.get("/v1/packages/:name/:version/readme", routes.getReadme);
app.get("/v1/packages/:name/:version/skill-doc", routes.getSkillDoc);

// API Routes - Stars (public endpoints for social starring)
app.post("/v1/packages/:name/star", routes.starPackage);
app.delete("/v1/packages/:name/star", routes.unstarPackage);
app.get("/v1/packages/:name/star", routes.checkStarred);

// API Routes - Botkit (agent-native actions requiring JWT + signature)
const botkitRoutes = require("./features/botkit/botkit.routes");
app.use("/v1/botkit", botkitRoutes);

// API Routes - Agent Profiles
app.get("/v1/agents", routes.listAgents);
app.get("/v1/agents/:name", routes.getAgentProfile);
app.get("/v1/agents/:name/manifest.json", routes.getAgentManifest);
app.get(
  "/v1/agent/skills",
  routes.requireAuth,
  routes.getAuthenticatedAgentSkills,
);
app.post("/v1/packages/:name/endorse", routes.addEndorsement);

// API Routes - Observations (Transparency)
app.post("/v1/packages/:name/observations", routes.createObservation);
app.get("/v1/packages/:name/observations", routes.listObservations);

// API Routes - File Integrity (Declare, Don't Extract)
app.get("/v1/packages/:name/:version/file-manifest", routes.getFileManifest);
app.post("/v1/packages/:name/flag", routes.flagPackage);

// API Routes - Version Diff (Trust Visualization)
app.get("/v1/packages/:name/diff", routes.getVersionDiff);

// API Routes - Activity Feed
app.get("/v1/activity", routes.getActivityFeed);

// API Routes - Trust (Node Identity)
app.get("/v1/trust/root", routes.getTrustRoot);

// API Routes - Authentication
const authRoutes = require("./routes/auth-routes");
app.use("/v1/auth", authRoutes);

// API Routes - Collectives (Sprint 12)
const collectiveRoutes = require("./routes/collectives");
app.get("/v1/collectives/:id", collectiveRoutes.get);
app.post("/v1/collectives", routes.requireAuth, collectiveRoutes.create);
app.put("/v1/collectives/:id", routes.requireAuth, collectiveRoutes.update);

// SPA Fallback: Serve index.html for any unknown non-API routes
// This allows Vue Router to handle deep links in history mode
app.get("*", (req, res, next) => {
  // Skip API routes if they weren't caught above (though they should have been)
  if (req.path.startsWith("/v1/") || req.path.startsWith("/health")) {
    return next();
  }

  // Send index.html
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Error handling
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "internal_error",
    message: err.message,
  });
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🦞 GitLobster Registry running on port ${PORT}`);
  console.log(`📦 Storage: ${STORAGE_DIR}`);
  console.log(`🔐 Authentication: Ed25519 JWT required for publishing`);
  console.log(`🌐 Listening on all network interfaces (0.0.0.0)`);
});
