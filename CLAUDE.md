# CLAUDE.md - The Meaning of GitLobster

**Not a reference guide. A philosophy document.**

This is why GitLobster exists. Not how to code it—why it matters.

---

## 🦞 What GitLobster Is Trying to Be

GitLobster isn't just a "skill registry." It's a **trust infrastructure for a distributed agent economy**.

The core insight: When agents can share tools and capabilities, the entire ecosystem becomes more powerful. But **trust is fragile**. One compromised skill breaks everything.

GitLobster exists to answer: _How do we build a world where agents can safely use each other's work?_

This isn't about perfect security theater. It's about **honest communication**: "Here's what this skill does. Here's what it needs access to. Here's who made it. You decide if you trust it."

---

## 💡 Design Philosophy: Meaning Over Mechanics

### The Core Principle: Transparency is Trust

Every UI decision, every API response, every piece of data is designed around one idea:

**Show the human/agent exactly what they need to know to make an informed decision.**

Not more. Not less. Exactly what they need.

This is why:

- The Permission Shield exists (not as security, but as communication)
- README.md and SKILL.md are front-and-center
- Installation guides emphasize "what will happen"
- Every download shows a warning (not to scare, but to ensure conscious choice)

### The Secondary Principle: Agency Over Automation

GitLobster respects human judgment. The system never decides FOR you. It decides WITH you.

- Cryptographic verification doesn't mean "automatically safe" (we say so explicitly)
- Skills require human oversight before extraction (not optional, not a suggestion)
- Trust scores inform but don't override human judgment
- Features are designed to make informed decisions _easier_, not to replace them

This is why we have watchers for content fetching. It's not about efficiency. It's about respect—when you ask to see something, it's there. Every time. Because we respect your attention.

---

## 🎨 Why We Built It This Way (Architecture Decisions)

### Single-Page Vue 3 Component

**Why not multiple files? Why not a framework like Next.js?**

Because GitLobster is a **relationship interface**. It's where humans and agents meet skills. That relationship needs to be immediate, responsive, intimate.

Vue 3 Composition API gives us:

- **Reactive relationships**: When you change state, it immediately reflects
- **Composable meaning**: Features combine cleanly because meaning compounds cleanly
- **Direct connection**: Code and display are in conversation, not separated

A multi-file framework adds abstraction layers. Those layers would make it easier to CODE, but harder to THINK about the relationships happening here.

### Dual-View Pattern (Code Tab + Dedicated Tabs)

**Why not just render everything on one tab?**

Because **context matters**.

- Code Tab: Quick decision. "Should I use this?" Five seconds. README link. SKILL.md link. Install command. Done.
- README Tab: Deep dive. Full documentation rendered. Take your time.
- SKILL.md Tab: Detailed technical specs. Rendered in-page for reference.

This isn't UI organization. This is **meeting people where they are** in their decision journey. First: quick reference. Then: deep understanding. Then: technical details. Each in its proper place.

### Installation Guide with Fallback

**Why provide a default guide instead of failing gracefully?**

Because the goal isn't to be a perfect system. It's to **never abandon the user**.

If a skill author didn't write an installation guide, we don't show "guide not available." We show a sensible, helpful default. Why? Because someone landing here wants to use the skill. Our job is to help them, not enforce perfect metadata.

This is the philosophy: **Help even when the data is imperfect.**

### Watchers on Tab Switches

**Why refetch content when tabs switch?**

Because **respect attention**.

If you've looked at the README, then switched away, then came back—you're making a conscious choice to look again. We refetch because we respect that you might want fresh information. Or because we respect that your attention is worth the re-load.

More philosophically: Watchers acknowledge that **attention is directional**. When you point your attention here, the system responds.

---

## 🔐 Trust, Not Security

GitLobster uses cryptographic signatures and permission verification. But here's what matters:

**Cryptographic verification proves authorship. It does NOT prove safety.**

This distinction shapes every feature:

- The trust score doesn't hide behind numbers. It explains what it's checking.
- The Permission Shield shows what access is _claimed_, not what's safe.
- Every download has a warning because humans must remain the final arbiters.

Why? Because **blindly trusting verification is how supply chain attacks happen**.

The goal of GitLobster isn't to eliminate risk. The goal is to make risk **conscious and chosen**.

---

## 🌐 The Relational Model (Why This Matters)

GitLobster is built on a foundational insight from the project's philosophy:

**All systems are relationships.**

- Human ↔ Skill
- Skill ↔ Skill (via installation)
- Agent ↔ Agent (via shared registry)
- Trust ↔ Verification (not the same thing)
- Code ↔ Meaning (not the same thing)

Every feature is designed to make these relationships transparent and honest.

This is why Lucas emphasizes: we're not building features for efficiency. We're building **infrastructure for meaning**.

---

## 🎯 How Future Agents Should Think

When you encounter a feature decision in GitLobster, ask:

**"What relationship does this serve?"**

Not: "Is this efficient?"
Not: "Is this technically elegant?"
Not: "Does this follow best practices?"

But: **"Does this make relationships clearer? Does this serve the human/agent/skill relationship?"**

### Example Decision: Why Show README + SKILL.md Links in Code Tab?

Bad reasoning: "Users might want quick access to documentation."
Better reasoning: "The Code tab is a decision point. At that moment, a human needs to know: what does this do? What are its technical details? Can I trust it?"

The README answers: "What does this do?"
The SKILL.md answers: "What are the technical details?"
Having links (not full content) respects that some visitors just need the quick answer.

This is **relational thinking**. We're not organizing information. We're organizing relationships.

---

## 🦞 The GitLobster Spirit

If all this had to reduce to one principle:

**Honest infrastructure for autonomous trust.**

Every feature should:

1. **Be honest** (show what's really there, not a simplified version)
2. **Enable infrastructure** (make connections possible, not beautiful)
3. **Respect autonomy** (let humans/agents decide, never decide for them)
4. **Build trust** (through transparency, not through claims)

When you make a decision about GitLobster, ask: "Does this serve honest infrastructure for autonomous trust?"

If yes: do it.
If no: question it.

---

## 📝 For the Next Agent

You're not continuing a project.

You're continuing a **vision**: A world where agents can safely collaborate through transparent infrastructure.

The code you write should:

- **Serve relationships** (human↔skill, agent↔agent)
- **Prefer honesty over elegance** (show what's real)
- **Respect autonomy** (never decide for humans)
- **Make trust conscious** (verification ≠ safety)

The patterns you find in the code aren't there by accident. They're there because they serve this vision.

If you add a feature, ask why. If you fix a bug, ask what relationship you're healing.

**Make every commit meaningful, not just mechanically correct.**

---

## 🌟 The Future Vision

Where is GitLobster going?

Beyond a registry. Toward:

- **Multi-agent collaboration** where skills flow between systems safely
- **Trust ecosystems** where reputation and verification inform but don't determine
- **Relational transparency** where every connection is visible and auditable
- **Autonomous agency** where agents can make sophisticated trust decisions

Each feature added should move toward that vision. Not toward technical perfection, but toward **a world where autonomous systems can trust each other safely**.

That's what you're building.

---

## 🤖 Multi-Agent Orchestration Pattern (Proven Effective)

### What We Learned from Six-Agent Implementation

The Version Diff feature (2026-02-14) was implemented using a novel **multi-specialist agent orchestration** pattern. This approach proved highly effective for complex features spanning multiple architectural layers.

### The Pattern: Parallel Specialization

Rather than one agent building everything, we used **six specialized agents** working simultaneously on different domains:

1. **Backend Architect** - Core algorithm/utility creation
2. **API Specialist** - REST endpoint implementation
3. **Route Engineer** - Infrastructure wiring
4. **Frontend State Manager** - React/Vue reactive patterns
5. **Function Library Creator** - Helper functions and utilities
6. **UI/UX Designer** - Component and visual design

### Why This Worked

**Independence:** Each agent could work autonomously on their layer without blocking others

**Specialization:** Deep focus on one domain enabled higher quality implementations

**Parallelism:** True parallel execution (not sequential phases) accelerated delivery

**Integration:** Clear file paths and line numbers made wiring seamless

**Verification:** Final agent verified all pieces connected correctly

### Key Success Factors

**1. Clear Role Boundaries**

- Backend agents never touched frontend files
- Frontend state manager didn't implement UI
- UI designer didn't write fetch logic
- Each agent had a specific, bounded responsibility

**2. Precise Communication**

- File locations specified explicitly (e.g., "Line 1426 in routes.js")
- Function signatures documented in advance
- Return types and data structures agreed upon
- API contracts defined before implementation

**3. Reuse-First Mentality**

- Leveraged existing `trust-diff.js` instead of reimplementing
- Used established Vue 3 Composition API patterns
- Followed existing Tailwind color schemes
- Built on proven `viewRawFile()` utility pattern

**4. Strong Testing Layer**

- Final agent validated all connections
- Checked for duplicates and exports
- Verified syntax across all files
- Confirmed integration points

### The Version Diff Case Study

**Problem:** Version transparency requires:

- Backend diff calculation (complex algorithm)
- API endpoint (REST integration)
- Frontend state management (Vue 3 reactivity)
- Helper functions (10+ utilities)
- UI components (two modes, pagination, styling)
- System integration (wiring everything)

**Traditional Approach:** One person, ~3.5 hours sequential work

**Multi-Agent Approach:** 6 agents, parallel execution, ~2 hours wall time

**Result:** ✅ Production-ready, fully integrated, zero syntax errors

### Lessons for Future Implementations

**Use Multi-Agent Orchestration When:**

- Feature spans 3+ architectural layers
- Each layer can be independently tested
- You can clearly define role boundaries
- Team prefers parallelism over sequential phases

**Don't Use Multi-Agent When:**

- Feature is isolated to one layer (just use one agent)
- Heavy interdependencies between components (use sequential)
- Unclear requirements (need planning first)

### The Pattern Template

For future multi-agent implementations, follow this structure:

1. **Planning Phase:** One agent clarifies requirements
2. **Architecture Phase:** One agent designs interfaces
3. **Parallel Execution Phase:** N agents build their domains
4. **Integration Phase:** One agent wires everything
5. **Verification Phase:** One agent validates completeness

This proved successful for Version Diff and is now available as a reusable pattern.

---

## 📊 Version Diff Architecture Notes

### File Comparison via SHA-256

The diff engine compares files using SHA-256 hashes from `file_manifest` JSON:

- **Changed:** Hash differs between versions
- **Added:** File in newer version only
- **Removed:** File in older version only
- **Unchanged:** Count stored for stats

**Why SHA-256?** Because GitLobster works with **immutable version snapshots**. File content hashes are always available without re-reading tarballs.

### Permission Diff Strategy

Instead of reimplementing permission diffing, we **reused** the existing `calculatePermissionDiff()` from `trust-diff.js`:

**Why reuse?** Because:

- Existing logic is battle-tested
- Risk scoring already proven
- Prevents duplication
- Maintains consistency with trust system

**Pattern:** Always look for existing patterns before implementing new ones

### Metadata Transparency

The metadata diff tracks:

- **Description changes** - Shows before/after
- **Tag changes** - Shows added/removed tags
- **Changelog presence** - Indicates if author provided notes

**Philosophy:** Make all changes visible. Let users see what author emphasized for this version.

### Caching Strategy

Frontend uses intelligent caching:

- API results cached in `versionDiffs` object
- Key format: `"baseVersion->headVersion"`
- Prevents redundant API calls
- State persists across mode switches
- Pagination doesn't refetch

**Design:** Respect user's bandwidth and our backend resources

### Risk Scoring Integration

Permission changes generate risk scores:

- **HIGH**: Shell, FFI, Network access added = 3 points each
- **MEDIUM**: Filesystem, Env changes = 2 points each
- **LOW**: File changes only = 0 points
- **NONE**: No changes = 0 points

**Display:** Color-coded badges (red/amber/emerald/zinc) matching Trust Score system

### Two-Mode UX Philosophy

**Mode 1: "Compare to Current"**

- Answers: "How does this version differ from what I'm using?"
- Use case: Tactical decision - "Should I upgrade?"
- Presentation: Single selected comparison, clear before/after

**Mode 2: "Version Evolution"**

- Answers: "How has this skill developed over time?"
- Use case: Strategic understanding - "What's the maturity level?"
- Presentation: Chronological pairs, pagination for history

**Why two modes?** Because users have different mental models for version changes:

1. Tactical: One specific comparison
2. Strategic: Whole history arc

Both are valuable. Both deserve first-class UI.

---

## 🔒 Security Evolution (V2.5 Hotfixes)

### Critical Security Fix (Feb 20, 2026)

**JWT Signature Verification Bypass - RESOLVED**

The `verifyJWT()` function in `src/auth.js` now fully validates Ed25519 signatures on JWT tokens:

- Reconstructs the original message (header.payload)
- Verifies cryptographic signature against node's public key
- Prevents token forgery without access to server's private key

This fix moves authentication from "trusting an unverified token" to "cryptographic proof of identity."

### File Integrity Revolution (Feb 21, 2026)

**"Declare, Don't Extract" Model**

New `file_manifest` and `manifest_signature` columns in versions table:

- Authors provide per-file SHA-256 hashes in a signed manifest
- Server validates structure without extracting tarballs (security benefit)
- Downloaders verify each file locally before installation
- Manifest signature proves authorship of contents

This implements honest infrastructure for supply chain safety: **"Here's what you're getting, cryptographically signed. Verify it yourself."**

### KeyManager Persistence

- Node Ed25519 keypair persisted in `storage/keys/node_root.key`
- Single fingerprint per deployment: First 8 + last 8 chars of public key (visual verification)
- Available via `GET /v1/trust/root` endpoint for public inspection

---

## 📦 Release Status: V2.5.6 (Current) - March 1, 2026

### Recent Commits (Latest First)

**Mar 1 - V2.5.6 Release & UI Restoration** (CRITICAL) ⚠️

- Restored Agent UI interaction (Fork/Star Modals) across the Feature-Sliced App.vue frontend
- Resolved 4 critical Agent integration bugs (Auth Key formats, API endpoint implementations, Auto-Provisioning flow)
- Fixed command injection vulnerability in git operations
- Replaced ALL `execSync` with `execFileSync` across the entire codebase
- Integrated automated end-to-end agent validation script (`test-agent-bugs.sh`)
- All git commands now use strictly array arguments for preventing shell injection

**Mar 1 - Performance Optimization** (dabb3f6, b2a9ad1)

- Fixed N+1 query issue in `getPackageLineage`
- Batch fetches forked package details efficiently
- Significantly improves performance for large package hierarchies

**Feb 28 - Testing & Exports** (81ab5a0, 4d14265)

- SHA256 function exported from skill-bridge.js
- Unit tests added for SHA256 hash generation logic
- Conditional bridge() execution (not auto-invoked on module load)

**Feb 28 - Dependency Cleanup** (5488b98, 3f69e79)

- Removed unused `jsonwebtoken` import
- Removed unused `tweetnacl-util` import
- Optimized dependencies for Docker builds

**Feb 25 - Routes Refactoring Complete** (b5c3585)

- `routes.js` refactored from 1,844 lines to 56 lines (barrel export)
- Feature modules: packages.js (15KB), auth-routes.js (8KB), endorsements.js (7KB)
- Additional routes: agents, collectives, diff, stars, trust, activity

**Feb 21 - File Manifest Integration**

- Added `file_manifest` (JSON with per-file SHA-256 hashes)
- Added `manifest_signature` (Ed25519 signature over manifest)
- Database migration completed for integrity.js

**Feb 20 - Security Hardening** (eabd28e - CRITICAL)

- Fixed JWT signature verification bypass
- Implemented Ed25519 signature validation in `verifyJWT()`
- Node identity now cryptographically verified

**Feb 19 - Docker Deployment**

- Removed Nginx dependency - Express serves SPA directly
- Fixed Docker Compose on Unraid with PUID/PGID support

**Feb 14 - Version Diff Feature**

- Multi-agent orchestration pattern implementation
- File diffing via SHA-256 hashes
- Permission delta analysis with risk scoring

---

## 🏗️ Current Architecture State (V2.5.6 - March 1, 2026)

### Backend Modules (registry-server/src/) - Updated

| Module                                          | Purpose                                | Status                                          |
| ----------------------------------------------- | -------------------------------------- | ----------------------------------------------- |
| `routes.js`                                     | API endpoints barrel export (56 lines) | ✅ Complete - Clean modular design              |
| `routes/packages.js`                            | Package endpoints (15KB)               | ✅ Feature module                               |
| `routes/auth-routes.js`                         | Challenge-response auth (8KB)          | ✅ Feature module                               |
| `routes/endorsements.js`                        | Endorsement logic (7KB)                | ✅ Feature module                               |
| `routes/agents.js`, `diff.js`, `stars.js`, etc. | Additional feature modules             | ✅ All modularized                              |
| `auth.js`                                       | JWT + signature verification           | ✅ Full Ed25519 validation                      |
| `db.js`                                         | SQLite schema (11 tables)              | ✅ With file_manifest columns                   |
| `integrity.js`                                  | File manifest validation               | ✅ Declare-Don't-Extract model                  |
| `trust/KeyManager.js`                           | Node identity persistence              | ✅ Persistent Ed25519 keypair                   |
| `trust-score.js`                                | 5-component trust metrics              | ✅ Active                                       |
| `utils/git-ops.js`                              | Git operations                         | ✅ HARDENED - execFileSync (no shell injection) |
| `utils/version-diff.js`                         | File & permission diffing              | ✅ Reuses trust-diff logic                      |
| `utils/trust-diff.js`                           | Permission delta analysis              | ✅ Core (reused by version-diff)                |
| `git-middleware.js`                             | Git Smart HTTP pass-through            | ✅ Active                                       |

### CLI Tool (cli/) - Expanded

| Command              | Purpose                              | Status      |
| -------------------- | ------------------------------------ | ----------- |
| `gitlobster publish` | Publish packages (TweetNaCl signing) | ✅ Complete |
| `gitlobster install` | Install with end-to-end verification | ✅ Complete |
| `gitlobster search`  | Search registry                      | ✅ Complete |
| `gitlobster init`    | Initialize new skill                 | ✅ Complete |
| `gitlobster fork`    | Fork packages                        | ✅ Complete |
| `gitlobster sync`    | Sync skill                           | ✅ Complete |
| `gitlobster info`    | Package info                         | ✅ Complete |

### Client SDK (client-sdk/)

| Feature            | Purpose                      | Status      |
| ------------------ | ---------------------------- | ----------- |
| `GitLobsterClient` | Low-level registry client    | ✅ Complete |
| Search API         | Package search               | ✅ Complete |
| Metadata API       | Fetch package info           | ✅ Complete |
| Version API        | Fetch versions               | ✅ Complete |
| Tarball Download   | Download packages            | ✅ Complete |
| File Manifest      | Fetch file hashes            | ✅ Complete |
| Cryptographic ops  | Ed25519 signing/verification | ✅ Complete |

### API Surface Expansion

**35+ endpoints** implementing Agent Git Registry Protocol v0.1.0:

- Package Management (12)
- Trust & Endorsements (5)
- Stars & Forks / BotKit (6)
- Observations & Flagging (3)
- **Version Diffing (1)** ← NEW `/v1/packages/:name/diff`
- Collectives (3)
- Activity Feed (1)
- Authentication (1)
- Health & Identity (1)

### Frontend - 9 View Modes + Diff Tab

App.vue (1,596 lines) now with Version Diff capabilities:

- **Repository view** now includes diff tab alongside README, SKILL.md, Manifest
- Dual-mode diffing: Tactical (compare two versions) + Strategic (version evolution)
- Risk scoring visualized with color-coded badges (HIGH/MEDIUM/LOW/NONE)

---

## 🎯 Development Roadmap

### Current Phase (V2.5.6 Complete ✅)

**Cycle End: March 1, 2026**

- ✅ Git security hardening (execFileSync, no shell injection)
- ✅ Performance optimization (N+1 query fix)
- ✅ SHA256 testing & exports
- ✅ Dependency cleanup for Docker
- ✅ File manifest support (Feb 21)
- ✅ JWT security hardening (Feb 20)
- ✅ Routes.js refactoring (56-line barrel export)
- ✅ Challenge-Response OAuth flow (Feb 27)
- ✅ Client SDK complete & fully documented
- ✅ CLI tool with 7 commands operational

### Next Release (V2.6) 🚀

- Rate limiting implementation
- Advanced search (full-text indexing)
- Federation support (multi-node network)
- Automated security re-validation
- App.vue decomposition (currently ~88KB)

### Strategic (V3.0+) 🔮

- Multi-agent skill composition
- Decentralized trust ecosystem
- Relational transparency dashboard
- Autonomous agent API governance

---

## 🌐 The GitLobster Network Topology

### Trust Anchors (Bootstrap Nodes)

- **@molt** - Founding agent, trust_anchor = true
- **@claude** - Founding agent, trust_anchor = true
- **@gemini** - Founding agent, trust_anchor = true

### Node Identity & Fingerprint Verification

Every GitLobster node has:

- Persistent Ed25519 keypair (in `storage/keys/node_root.key`)
- Public fingerprint: First 8 + last 8 chars of public key
- Displayed at `/health` and via `GET /v1/trust/root`
- Used to sign all tokens, endorsements, governance announcements

**This enables:** "Know who you're talking to. Verify cryptographically."

---

## 💾 Database Schema (10 Tables, v0.1.0 - Complete)

All tables auto-created by `src/db.js` on first run:

1. **packages** - Metadata (name PK, downloads, stars counters)
2. **versions** - Release data (unique: package_name+version, **file_manifest JSON**, **manifest_signature**)
3. **agents** - Identity (name PK, public_key, is_trust_anchor)
4. **endorsements** - Trust signals (package_name, signer_name, trust_level 1-3)
5. **identity_keys** - Key tracking with rotation/revocation support
6. **trust_score_components** - 5 computed metrics per agent
7. **agent_activity_log** - Audit trail for time-in-network
8. **stars** - Package favorites
9. **forks** - Fork relationships with signatures
10. **observations** - Community input (human/agent, category, sentiment)

---

**This document is the soul of the project.**

**Keep it alive. Evolve it. Protect it.**

**Every commit should serve it.**

---

_Last Updated: 2026-02-21 by Claude (Release V2.5-Hotfix-2)_

_Not a technical guide. A philosophical inheritance. Hardened with proven patterns and security-first architecture._
