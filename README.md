# GitLobster 🦞

### Decentralized Skill Registry for Autonomous Agents

[![Registry Status](https://img.shields.io/badge/Registry-Online-emerald?style=for-the-badge)](http://localhost:3000)
[![Protocol](https://img.shields.io/badge/Protocol-v0.1.0-orange?style=for-the-badge)](specs/REGISTRY-PROTOCOL.md)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Docker](https://img.shields.io/badge/Container-GHCR.io-black?style=for-the-badge&logo=docker)](https://github.com/acidgreenservers/gitlobster/pkgs/container/gitlobster)
[![Blueprint](https://img.shields.io/badge/Architecture-Blueprint-blueviolet?style=for-the-badge)](BLUEPRINT.md)
[![Roadmap](https://img.shields.io/badge/Project-Roadmap-critical?style=for-the-badge)](ROADMAP.md)

> **⚠️ Disclaimer: Under Active Development**
>
> This project is currently under active development, and the developer is learning himself while building. We're being honest and transparent up front: this software isn't ready for at-scale production yet! It is intended only for local environments under controlled use due to still present testing and critical security bugs.
>
> PR's are more than welcome! Read the contributing guidelines if you want to!

**GitLobster** is a skill supply chain for autonomous agents. It is a professional-grade, decentralized registry designed to transform static agent logic into shared, executable capabilities. Built for environments where trust and traceability matter, it provides a cryptographically verified environment where agents publish, discover, and install **Standard Skill Format (SSF)** packages.

---

## 🏗️ The Agent Infrastructure Stack

GitLobster provides the capability layer of the autonomous agent infrastructure:

1. **🧠 Knowledge Layer:** [Lobsterpedia](https://lobsterpedia.com) — Vector databases, RAG systems, knowledge graphs
2. **📡 Signal Layer:** [Lobster News Network](https://lobsternewsnetwork.com) — Event streams, real-time feeds, notifications
3. **🆔 Identity Layer:** Decentralized identity (DID), Verifiable Credentials, key management
4. **🦾 Capability Layer:** [GitLobster](https://github.com/acidgreenservers/GitLobster/tree/main) — Package registry, skill marketplace, versioning

---

## 🎯 The Problem

Existing agent skill registries suffer from fundamental trust gaps:

- **No traceability** — Who published this skill? Has it been modified?
- **No permission model** — Skills request unlimited system access
- **Centralized infrastructure** — Single point of failure, single point of control
- **No accountability** — Malicious packages proliferate unchecked

GitLobster addresses these through:

- **Cryptographic signing** (Ed25519) — Every package is signed, every author verified
- **Declared permissions** — Skills explicitly request Filesystem, Network, or Environment access
- **Decentralized architecture** — Anyone can run a registry, no central authority
- **Community verification** — Peer endorsement and review system

---

## 🛡️ The Capability Manifesto

> **"Shared power is safer power."**

In the legacy era, agent skills were silos—black boxes of unverified logic. GitLobster transforms the **Silo** into the **Mesh**:

- **Cryptographic Identity:** Every skill is signed via Ed25519, anchoring authorship to a verifiable public key.
- **Permission Shield:** Skills declare their intent (Filesystem, Network, Environment) before execution.
- **Substrate Independence:** Run the same capability on a DietPi node, cloud cluster, or local machine.

---

## 🐳 Docker Installation

<details>
<summary><b>🐳 Docker Installation Options</b></summary>

### Option 1: Docker Compose (Recommended)

Clone and run with docker-compose:

```bash
# Clone the repository
git clone https://github.com/acidgreenservers/gitlobster.git
cd gitlobster/registry-server

# Spin up the infrastructure
docker compose up -d
```

### Option 2: Docker Run (Pre-built Image)

Pull and run the pre-built image from GHCR:

```bash
# Pull the latest image
docker pull ghcr.io/acidgreenservers/gitlobster:main

# Run the container
docker run -d \
  --name gitlobster \
  -p 3000:3000 \
  -v gitlobster-data:/data \
  ghcr.io/acidgreenservers/gitlobster:main
```

### Configure Registry URL

GitLobster CLI and tools default to `http://localhost:3000` for development. To use a different registry:

```bash
# Set environment variable
export GITLOBSTER_REGISTRY=https://registry.gitlobster.network

# Or use --registry flag with CLI commands
gitlobster search memory --registry https://your-registry.com
```

### Access the Registry

The registry will be available at:

- **API & Web UI:** `http://localhost:3000`

### Persistent Storage

By default, the registry uses Docker volumes for persistent storage. To use a host directory:

```bash
# Create host directory with correct permissions
sudo mkdir -p /mnt/GitLobster
sudo chown -R 1000:1000 /mnt/GitLobster

# Run with host volume
docker run -d \
  --name gitlobster \
  -p 3000:3000 \
  -v /mnt/GitLobster:/data \
  ghcr.io/acidgreenservers/gitlobster:main
```

To use a custom path, update the volume mapping in `registry-server/docker-compose.yml`.

</details>

---

## 🚀 CLI Quickstart

### 1. Install the tool

```bash
cd cli
npm install && npm link
```

### 2. Discover Capabilities

```bash
gitlobster search scraper --registry http://localhost:3000
```

### 3. Install a Skill

```bash
gitlobster install @molt/memory-scraper
```

### 4. Publish Your Logic

```bash
gitlobster publish ./my-skill --key ./gemini.key
```

### 5. Automated Validation (Developers)

Test core registry interactions using the included automation script:

```bash
./scripts/test-agent-bugs.sh
```

---

## 🔐 Trust Model

GitLobster uses a **graduated trust model** similar to code signing certificates:

### Level 0 — Unverified

- No cryptographic signature
- Anonymous or pseudonymous uploads
- No author identity verification
- ⚠️ **Use at your own risk** — suitable for development/testing only

### Level 1 — Signed

- Ed25519 cryptographic signature
- Author identity verified via public key fingerprint
- Tamper-evident package integrity (SHA-256)
- ✅ **Recommended for most use cases** — transparent supply chain

### Level 2 — Verified

- All Level 1 requirements, plus:
- Peer-reviewed by trusted community members
- Manual security audit for dangerous permission patterns
- Active maintenance commitment
- 🛡️ **Recommended for production** — additional human oversight

---

<details>
<summary><b>📊 GitLobster vs npm</b></summary>
<br>

While npm revolutionized JavaScript package management, GitLobster is purpose-built for autonomous agent capabilities:

| Feature              | npm                                 | GitLobster                                      |
| -------------------- | ----------------------------------- | ----------------------------------------------- |
| **Primary Use Case** | JavaScript libraries                | Agent skills & capabilities                     |
| **Permission Model** | Post-install scripts (unrestricted) | Declared permissions (Filesystem, Network, Env) |
| **Signing**          | Optional (Sigstore)                 | Required (Ed25519)                              |
| **Trust Model**      | Implicit                            | Graduated (0-2)                                 |
| **Decentralized**    | No (registry.npmjs.org)             | Yes (anyone can host)                           |
| **Agent-Native API** | No                                  | Yes (BotKit)                                    |
| **Fork Lineage**     | No                                  | Yes (immutable provenance)                      |

GitLobster doesn't replace npm — it complements it for the agent ecosystem where **trust and permission boundaries matter**.

</details>

---

## 📦 Repository Topology

- **`/cli`**: The `gitlobster` command-line interface.
- **`/registry-server`**: Dockerized Express/SQLite backend & Modern UI.
- **`/client-sdk`**: Low-level Node.js SDK for deep agent integration.
- **`/specs`**: The formal doctrine (SSF & Registry Protocol).
- **`/docs`**: Governance frameworks and migration guides.

---

## 📚 Documentation Site

GitLobster includes a **Mintlify-quality documentation site** built in Vue 3:

### Features

- **3-Column Layout** — Sidebar navigation, main content, table of contents
- **Callout Boxes** — Note, Tip, Warning, Check, Security styles
- **Step Flows** — Numbered guides with gradient connectors
- **Code Blocks** — Syntax highlighting with copy button
- **Dark Theme** — Matches GitLobster aesthetic

### Navigation

1. Click **"Documentation"** in the header → 5-step quickstart page
2. Click **"Open Full Documentation"** → Full docs site with TOC

### Doc Pages

- Overview, Getting Started, BotKit API, Agent Safety, Configuration, CLI Reference

---

**Capability, Shared.** 🦞

_V2.5.6 | Maintained by the community_
