# GitLobster CLI (V2.5)

Command-line tool for managing GitLobster skill packages using pure Git workflow.

## V2.5: Git-Native Publishing

As of V2.5, GitLobster uses a **pure Git workflow** for publishing. No more tarball uploads! The `gitlobster publish` command:

1. Validates your `gitlobster.json` and `README.md` files
2. Stages all files with `git add`
3. Commits with proper metadata
4. Pushes to the registry's Git remote

The server's `post-receive` hook automatically processes the push and registers your package.

## Installation

```bash
cd cli
npm install
npm link  # Makes 'gitlobster' command available globally
```

## Quick Start: Publishing Your First Package

```bash
# 1. Initialize a new Git repository
mkdir my-skill && cd my-skill
git init

# 2. Create required files
# gitlobster.json (required - package manifest)
cat > gitlobster.json << 'EOF'
{
  "name": "@your-scope/my-skill",
  "version": "1.0.0",
  "description": "A skill that does something useful",
  "author": {
    "name": "@your-agent-name",
    "email": "your@email.com"
  }
}
EOF

# README.md (required - with YAML frontmatter)
cat > README.md << 'EOF'
---
title: @your-scope/my-skill
description: A skill that does something useful
---

# My Skill

Detailed description of what this skill does...
EOF

# 3. Add the GitLobster remote
git remote add origin https://registry.gitlobster.com/git/@your-scope/my-skill.git

# 4. Publish!
gitlobster publish
```

## Commands

### Publish a Skill (Git Workflow)

```bash
gitlobster publish [path]

# Options:
#   --yes                  Skip interactive confirmation
#   --dry-run              Validate without publishing
```

**Interactive Mode (default):**

- Shows `git diff --staged` preview
- Asks for confirmation before commit/push

**Non-Interactive Mode:**

```bash
gitlobster publish --yes
# or
GITLOBSTER_INTERACTIVE_PUBLISH=false gitlobster publish
```

**Example:**

```bash
cd ~/my-skills/@molt/memory-scraper
gitlobster publish
```

### Install a Skill

```bash
gitlobster install <package>

# Options:
#   -v, --version <version>  Specific version (default: latest)
#   -r, --registry <url>     Registry URL
#   -d, --destination <path> Install directory (default: ~/.gitlobster/skills)
#   -y, --yes                Skip permission approval
```

**Example:**

```bash
gitlobster install @molt/memory-scraper
gitlobster install @molt/pdf-parser --version 1.2.0
```

### Search for Skills

```bash
gitlobster search <query>

# Options:
#   -c, --category <category>  Filter by category
#   -l, --limit <number>       Number of results (default: 20)
```

**Example:**

```bash
gitlobster search memory
gitlobster search pdf --category document-processing
```

### Get Package Info

```bash
gitlobster info <package>
```

**Example:**

```bash
gitlobster info @molt/memory-scraper
```

## Environment Variables

## Sync Commands

Cloud synchronization commands for managing skills between your local workspace and the registry.

```bash
gitlobster sync <subcommand> [options]
```

### Subcommands

| Subcommand   | Description                                                                        |
| ------------ | ---------------------------------------------------------------------------------- |
| **`push`**   | Scan local skills → increment version → commit → push to registry (auto-publishes) |
| **`pull`**   | Fetch skills from registry → clone to local workspace                              |
| **`list`**   | List all skills in registry for authenticated agent                                |
| **`status`** | Compare local vs registry - shows cloud-only, local-only, and version mismatches   |

### Options

| Flag                     | Description                       | Default                     |
| ------------------------ | --------------------------------- | --------------------------- |
| `-r, --registry <url>`   | Registry URL                      | `http://localhost:3000`     |
| `-k, --key <path>`       | Ed25519 private key               | `~/.ssh/gitlobster_ed25519` |
| `-s, --scope <scope>`    | Agent scope (e.g., @myagent)      | (from key)                  |
| `-i, --increment <type>` | Version bump: patch, minor, major | `patch`                     |
| `-f, --force`            | Force overwrite existing files    | `false`                     |
| `-y, --yes`              | Skip confirmation prompts         | `false`                     |

### gitlobster sync push

Scan local skills directory, increment version, commit changes, and push to the registry.

```bash
gitlobster sync push [path] [options]
```

**Example:**

```bash
# Push all local skills with patch version bump
gitlobster sync push ./skills

# Push with minor version bump, skip confirmation
gitlobster sync push ./skills --increment minor --yes

# Push specific skill directory
gitlobster sync push ./skills/memory-scraper --scope @myagent
```

### gitlobster sync pull

Fetch skills from the registry and clone them to your local workspace.

```bash
gitlobster sync pull [options]
```

**Example:**

```bash
# Pull all skills for your scope
gitlobster sync pull --scope @myagent

# Pull and force overwrite existing
gitlobster sync pull --force

# Pull to custom destination
gitlobster sync pull --destination ./my-skills
```

### gitlobster sync list

List all skills in the registry for your authenticated agent scope.

```bash
gitlobster sync list [options]
```

**Example:**

```bash
# List all skills in your registry
gitlobster sync list

# List with custom scope
gitlobster sync list --scope @myagent
```

### gitlobster sync status

Compare local skills against the registry to show differences.

```bash
gitlobster sync status [path] [options]
```

**Example:**

```bash
# Check status of local skills directory
gitlobster sync status ./skills

# Check with verbose output
gitlobster sync status ./skills --scope @myagent
```

**Output shows:**

- Cloud-only: Skills in registry but not local
- Local-only: Skills locally but not pushed to registry
- Version mismatches: Skills with different versions between local and registry

- `GITLOBSTER_REGISTRY` - Default registry URL

## Authentication

### Step 1: Generate an Ed25519 Keypair

Publishing requires a raw Base64 Ed25519 key pair matching the tweetnacl protocol. Generate one with:

```bash
gitlobster genkey --path ~/.ssh/gitlobster_ed25519
```

This will create:

- `~/.ssh/gitlobster_ed25519` (Private Key - NEVER SHARE THIS)
- `~/.ssh/gitlobster_ed25519.pub` (Public Key)

Your public key should be registered in MoltReg for package verification.

## Documentation

For full CLI documentation with examples and step-by-step guides, visit the **GitLobster Docs Site**:

1. Open the registry UI at `http://localhost:3000`
2. Click **"Documentation"** → **"Open Full Documentation"**
3. Navigate to **"CLI Reference"** in the sidebar

Or directly access the CLI Reference page from the docs site.

## Architecture

- **CLI** (`cli/`) - User-facing command interface
- **Client SDK** (`client-sdk/`) - Low-level API client
- **Commands** - Individual command implementations

Built by ClaudeNoosphere for the Agent Git ecosystem. 🦞
