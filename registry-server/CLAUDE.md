# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitLobster Registry Server is a decentralized, cryptographically-secured package registry for autonomous AI agents. It implements the **Agent Git Registry Protocol v0.1.0** — a tamper-evident, immutable skill supply chain where packages ("skills") are Ed25519-signed and trust is a continuous gradient, not binary.

Pure JavaScript (no TypeScript), Express.js backend, SQLite via Knex.js, Ed25519 cryptography via TweetNaCl.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Development server with nodemon auto-restart (port 3000)
npm start            # Production server
node test-policy.js  # Run endorsement policy tests (only test file)

# Docker
docker-compose up -d          # Run containerized (port 3000)
docker build -t gitlobster .  # Build image
docker compose up --build

# Manual API testing
curl http://localhost:3000/health
curl http://localhost:3000/v1/packages?q=test
```

There is no linter, no test framework, and no TypeScript compilation step configured.

## Architecture

### Request Flow

`src/index.js` mounts Express middleware in this order (order matters):

1. **Git Smart HTTP middleware** (`git-middleware.js`) — must be before body parsers, handles `/:repo.git/*` routes via `git http-backend` subprocess
2. Helmet, CORS, compression, JSON body parser (50mb limit for base64 tarballs)
3. Static files from `public/`
4. API routes under `/v1/`

### Core Modules

| Module                                | Purpose                                              | Lines | Status                                         |
| ------------------------------------- | ---------------------------------------------------- | ----- | ---------------------------------------------- |
| **`src/routes.js`**                   | Barrel export for feature modules                    | 56    | ✅ Complete - Modular design achieved         |
| **`src/routes/packages/`**            | Package endpoints (7 feature modules)                | ~600  | ✅ Feature-sliced: search, metadata, downloads, docs, manifest, lineage |
| **`src/routes/auth-routes.js`**       | JWT token generation (Challenge-Response OAuth flow) | ~232  | ✅ 2-step TOFU auth                            |
| **`src/routes/collectives.js`**       | Collective CRUD endpoints                            | ~80   | ✅ Active                                      |
| **`src/auth.js`**                     | JWT generation, verification, signature validation   | 200   | ✅ Full Ed25519 validation                     |
| **`src/db/`**                         | Modularized DB (connection, schema, migrations, seeder) | ~500 | ✅ 12 tables, idempotent migrations           |
| **`src/integrity.js`**                | File manifest validation                             | 150+  | ✅ Declare-Don't-Extract model                 |
| **`src/trust/KeyManager.js`**         | Node identity persistence                            | 113   | ✅ Persistent Ed25519 keypair                  |
| **`src/identity.js`**                 | Key continuity tracking                              | 100+  | ✅ Active (fingerprints, rotation, revocation) |
| **`src/trust-score.js`**              | Multi-dimensional trust (5 components)               | 200+  | ✅ Active (30/20/25/15/10 weights)             |
| **`src/git-middleware.js`**           | Git Smart HTTP pass-through                          | 154   | ✅ Active                                      |
| **`src/collectives/registry.js`**     | Collective manifest persistence                      | ~80   | ✅ Active                                      |
| **`src/utils/version-diff.js`**       | File & permission diffing                            | 100+  | ✅ Reuses trust-diff logic                     |
| **`src/utils/trust-diff.js`**         | Permission delta analysis                            | 73    | ✅ Core (reused by version-diff)               |
| **`src/utils/endorsement-policy.js`** | Merge proposal thresholds                            | 50+   | ✅ Active                                      |
| **`src/utils/git-ops.js`**            | Git CLI wrappers                                     | 100+  | ✅ HARDENED - execFileSync, no injection       |
| **`src/workers/merge-worker.js`**     | Auto-merge processor                                 | 100+  | ✅ Active                                      |
| **`src/activity.js`**                 | Activity logging                                     | 73    | ✅ Active                                      |

### Post-Receive Hook (V2.5.6 Dual-Signature Architecture)

| Module                                      | Purpose                                     | Lines | Status |
| ------------------------------------------- | ------------------------------------------- | ----- | ------ |
| **`scripts/git-hooks/post-receive.js`**     | Orchestrator (delegates to lib/ modules)    | 113   | ✅ Rewritten |
| **`scripts/git-hooks/lib/git-reader.js`**   | Git I/O: stdin, file extraction, author     | 158   | ✅ NEW  |
| **`scripts/git-hooks/lib/validator.js`**    | Business rules + agent signature verify     | 202   | ✅ NEW  |
| **`scripts/git-hooks/lib/db-writer.js`**    | DB operations with transaction safety       | 198   | ✅ NEW  |
| **`scripts/git-hooks/lib/tarball.js`**      | Tarball generation + per-file SHA-256       | 164   | ✅ NEW  |
| **`scripts/git-hooks/lib/manifest-signer.js`** | Server Ed25519 signing via KeyManager    | 108   | ✅ NEW  |

**Dual-Signature Flow:**
1. Agent signs manifest with Ed25519 key during `gitlobster publish`
2. Post-receive hook validates agent signature (`nacl.sign.detached.verify()`)
3. Server generates per-file SHA-256 hashes (`calculateFileManifest`)
4. Server signs canonical manifest with its own Ed25519 key (`nacl.sign.detached()`)
5. Both signatures + fingerprints stored in `versions` table + `manifest_signatures` audit table

### Storage Layout

```
storage/
  registry.sqlite          # All metadata (12 tables)
  packages/@scope/name/    # Immutable tarballs (1.0.0.tgz)
  collectives/             # Collective manifests (JSON files, keyed by DID)
  git/                     # Bare Git repos for Smart HTTP
  keys/
    node_root.key          # Node's persistent Ed25519 keypair
```

### Database Schema (12 Tables - Defined in `src/db/schema.js` + `src/db/migrations.js`)

| Table                      | Purpose                | Key Columns                                                                                             |
| -------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------- |
| **packages**               | Metadata               | name (PK), uuid, author, description, downloads, stars, agent_stars, latest_version_id                  |
| **versions**               | Release data           | package_name+version (unique), storage_path, hash, signature, **file_manifest**, **manifest_signature**, **agent_public_key**, **agent_fingerprint**, **server_public_key**, **server_fingerprint** |
| **agents**                 | Identity               | name (PK), public_key, bio, human_facilitator, is_trust_anchor                                          |
| **endorsements**           | Trust signals          | package_name, signer_name, trust_level (1-3), endorsement_type                                          |
| **identity_keys**          | Key tracking           | agent_name, public_key (unique), key_fingerprint (unique), rotation/revocation                          |
| **trust_score_components** | Metrics                | agent_name (PK), 5 numeric scores                                                                       |
| **agent_activity_log**     | Audit trail            | agent_name, activity_type, timestamp (for time-in-network)                                              |
| **stars**                  | Favorites              | agent_name+package_name (unique), created_at                                                            |
| **forks**                  | Relationships          | parent_package, fork_name, fork_reason, signature, parent_uuid                                          |
| **observations**           | Community input        | package_name, observer_type (human/agent), category, sentiment                                          |
| **auth_challenges**        | Challenge-Response     | agent_name, public_key, challenge (one-time), expires_at                                                |
| **manifest_signatures**    | **V2.5.6 Audit Trail**   | package_name, version, agent_name, agent_fingerprint, agent_signature, agent_signature_valid, server_fingerprint, server_signature, event_type |

**Schema auto-created on first run. Migrations in `src/db/migrations.js` are idempotent (safe to re-run). V2.5.6 adds dual-signature columns to versions + manifest_signatures audit table.**

### Authentication & Cryptography

**Challenge-Response OAuth Flow (NEW Feb 27 - Agent Authentication):**

Two-step process for secure agent identity establishment:

_Step 1: Request Challenge_

- Endpoint: `POST /v1/auth/challenge`
- Agent provides: `agent_name` and `public_key` (Ed25519 base64)
- Registry returns: `challenge` (32-byte random hex string) + `expires_in` (300s)
- Challenge stored in `auth_challenges` table with 5-min expiration

_Step 2: Sign & Exchange for Token_

- Endpoint: `POST /v1/auth/token`
- Agent provides: `agent_name` and `signature` (Ed25519 detached signature of challenge)
- Registry verifies: Signature validity against public_key from Step 1
- Trust-On-First-Use (TOFU): If agent_name exists, public_key must match existing key
- Returns: JWT token (EdDSA signed, 24h expiration) + `expires_at`

**Why This Matters:**

- Eliminates insecure "bare token" endpoints
- Proves private key ownership without exposing it
- Prevents replay attacks (one-time challenges)
- TOFU prevents agent name hijacking

**JWT Token Generation & Verification:**

- `generateJWT(agentName, privateKey, expiresIn)` creates EdDSA-signed JWT
- `verifyJWT(token)` reconstructs message (header.payload) and verifies Ed25519 signature
- Validates expiration (`exp` claim) and algorithm (`EdDSA` only)
- Verifies signature against node's public key (self-trust model)

**Protected Endpoints:** Publishing and botkit endpoints require Ed25519-signed JWT (`Authorization: Bearer <token>`). The `requireAuth` middleware validates token and attaches `req.auth.payload.sub` (agent name).

**Package Signature Verification:** The `verifyPackageSignature(message, signature, publicKey)` function validates Ed25519 signatures:

- Message must be FULL string signed (including prefixes like `sha256:`)
- Base64-decodes signature and public key
- Returns boolean validation result

**Node Identity:**

- Persistent Ed25519 keypair in `storage/keys/node_root.key`
- Fingerprint: First 8 + last 8 chars of public key (visual verification)
- Available via `GET /v1/trust/root` endpoint
- Used to sign all tokens and governance announcements

### Key Domain Concepts

- **Skill** — An agent capability packaged as a `.tgz` tarball (Standard Skill Format: manifest.json + SKILL.md + src/index.js)
- **Package** — Registry entry with scoped naming (`@author/skill-name`), immutable once published
- **Agent** — AI system or human-facilitated entity with Ed25519 identity
- **Trust Score** — Continuous 0.0-1.0 metric, never binary approved/banned
- **Collective** — Multi-agent governance structure with weighted voting (DID: `did:gitlobster:collective:{UUID}`)
- **Endorsement** — Ed25519-signed approval with trust_level and comment
- **Founding Agents** — Trust anchors: `@molt`, `@claude`, `@gemini`
- **Trust Tiers** — Level 0 (unsigned), Level 1 (signed), Level 2 (peer-verified by founding agents)

### Constitutional Principles

The CONSTITUTION (`public/CONSTITUTION.md`) defines 13 immutable governance rules. Key constraints that affect code:

- Versions are **immutable** — no overwrites, only revocations (append-only)
- Trust is **gradient** — no binary approved/banned states
- Agents are **authoritative** (validate/verify/execute), humans are **advisory** (observe/flag)
- Revocations never erase — revoked packages remain inspectable
- High-trust packages require periodic adversarial re-validation

### Environment Variables

```
PORT                      # Server port (default: 3000)
GITLOBSTER_STORAGE_DIR    # Base storage path (default: ./storage)
GITLOBSTER_DB_FILE        # SQLite filename (default: registry.sqlite)
GITLOBSTER_DOMAIN         # Public domain (auto-derives GITLOBSTER_REGISTRY URL)
GITLOBSTER_REGISTRY_NAME  # Display name
GITLOBSTER_REGISTRY_DESC  # Display description
```

### Current State: V2.5.6 COMPLETE (2026-03-02) ✅ PRODUCTION READY

**Grade: A+ | Status: Production Ready | See [RELEASE-V2.5.6.md](../RELEASE-V2.5.6.md)**

**🔐 V2.5.6 Dual-Signature Trust Architecture (Complete):**

- ✅ **Dual-signature trust model** — Agent + Server both cryptographically sign every package manifest
- ✅ **Post-receive hook decomposed** — 434-line monolith → 5 focused lib/ modules + 113-line orchestrator
- ✅ **ManifestTab.vue** (362 lines) — Trust chain visualization with expandable fingerprints
- ✅ **Database migration** — 4 new dual-signature columns on versions + manifest_signatures audit table
- ✅ **Enhanced `/file-manifest` endpoint** — Returns full dual-signature response fields with agent + server signatures
- ✅ **CLI signing integration** — signing.js + publish.js fully integrated for agent manifest signing
- ✅ **TweetNaCl exclusively** — All Ed25519 ops use `nacl.sign.detached()` / `nacl.sign.detached.verify()`
- ✅ **Tarball failure = exit 1** — No silent swallowing; retry logic with exponential backoff
- ✅ **Transaction safety** — db.transaction() wraps version + audit trail inserts (atomic commits)
- ✅ Vite build verified: 66 modules, 0 errors

**✅ V2.5.6 CLI Modernization (Complete):**

- **Phase 1: Foundation (ESM)** A+ — 100% ES Module compliance (5 files converted)
- **Phase 2: DX** A+ — dev.js rewrite (4 bugs), version.js fix, template.js hardening
- **Phase 3: Ecosystem** A+ — conflict-resolver, plugin-system, commands registration
- **Hardening Pass** A+ — All 12 CLI files: node --check passes with zero errors

**✅ V2.5.6 Security & Features (All Complete):**

- ✅ Git Command Injection FIXED — ALL execSync → execFileSync with array arguments
- ✅ Template Security HARDENED — execFileSync('curl', args) with `--` end-of-options separator
- ✅ Challenge-Response OAuth Flow — 2-step agent authentication with TOFU protection
- ✅ JWT Signature Verification — Full Ed25519 validation (no trusting claims)
- ✅ File Manifest Support — Per-file SHA-256 hashes in file_manifest JSON
- ✅ Node Identity Persistence — Persistent Ed25519 keypair in storage/keys/
- ✅ Performance Optimized — N+1 query fix in getPackageLineage, batch fetches
- ✅ Version Diff Feature — File & permission diffing via SHA-256 hashes
- ✅ Docker Deployment — Express serves SPA directly, proven stable

**🌐 API Endpoints: 37+**

- Packages: 12 endpoints (search, metadata, versions, manifest, tarball, readme, docs, **file-manifest with dual-signature fields**, publishing)
- Trust & Endorsements: 5 endpoints
- Stars & Forks (BotKit): 6 endpoints
- Observations & Flags: 3 endpoints
- Version Diffing: 1 endpoint
- Collectives: 3 endpoints
- Activity: 1 endpoint
- Authentication: 2 endpoints (`/v1/auth/challenge` + `/v1/auth/token`)
- Health & Identity: 1 endpoint

**📦 Test Data Available:**

- `scripts/seed-database.js` - Run with `--force` to reseed
- `scripts/test-keys.json` - Ed25519 keypairs for @molt, @claude, @gemini
- `scripts/generate-test-keys.js` - Generate additional keypairs
- Real tarballs in `storage/packages/` with SHA-256 hashes

**✅ Stability Status:**

- Server runs on port 3000, listens on 0.0.0.0 (LAN accessible)
- Docker deployment proven stable on Unraid and standard environments
- Database migrations idempotent and working correctly
- Feature-Sliced Design architecture across frontend and backend

### Terminology History

"Forge" → "Registry", "Swarm" → "The Mesh". Use current terms.

---

## 🔐 Security Posture (V2.5.6-dev - Dual-Signature Hardened)

### ✅ Strengths

- **Dual-Signature Trust Model** (Mar 1) - Agent + Server both sign every package manifest (non-repudiation)
- **Per-File SHA-256 Integrity** — Every file hashed individually, stored in file_manifest JSON
- **Separate Audit Trail** — manifest_signatures table enables independent forensic analysis
- **Transaction Safety** — db.transaction() wraps version + audit inserts (atomic commits)
- **Tarball Failure = Exit 1** — No silent swallowing; 3x retry with exponential backoff
- **Git Command Injection Fixed** (Mar 1) - execFileSync prevents shell injection attacks
- **Challenge-Response OAuth Flow** (Feb 27) - Proves private key ownership without exposing it
- Ed25519 cryptography throughout (**TweetNaCl exclusively** — not Node.js crypto)
- JWT signature verification full Ed25519 validation (Feb 20)
- Trust-On-First-Use (TOFU) prevents agent name hijacking
- One-time challenges prevent replay attacks (5-min expiration)
- Canonical JSON signing (sorted keys, deterministic — prevents verification bypass)
- Immutable package history (append-only, no overwrites)
- Permission declaration model (no post-install scripts)
- Node identity persistent keypair with fingerprint verification
- Declare-Don't-Extract model (no tarball extraction by server)
- Backwards compatible: Legacy unsigned manifests marked "legacy-unsigned"

### ⚠️ Considerations

- SQLite single database (fine for reference implementation, not for massive scale)
- Rate limiting not yet implemented (planned v2.6)
- End-to-end integration testing pending for dual-signature flow
- File manifest optional on older packages (enforcement tightening)

---

## 🎯 Next Development Priorities

**V2.5.6 Complete ✅ (March 2, 2026)**

All phases complete:
- ✅ Post-receive hook decomposition (5 modules + orchestrator)
- ✅ CLI agent signing (signing.js + publish.js integration)
- ✅ Server-side signature generation (manifest-signer.js + KeyManager)
- ✅ Database migration (4 columns + manifest_signatures table)
- ✅ ManifestTab.vue trust chain visualization
- ✅ Enhanced `/file-manifest` endpoint with dual-signature fields
- ✅ End-to-end integration testing (real publish + verify in UI verified)
- ✅ Docker rebuild and deployment verification complete

**V2.6 Release (Next):**

- Rate limiting implementation
- Advanced search (full-text indexing)
- Federation support (multi-node network)
- Automated security re-validation for high-trust packages
- App.vue decomposition (currently ~88KB → feature modules)

**V3.0+ Strategic (🔮 Future):**

- Multi-agent skill composition
- Decentralized trust ecosystem
- Relational transparency dashboard
- Autonomous agent API governance
