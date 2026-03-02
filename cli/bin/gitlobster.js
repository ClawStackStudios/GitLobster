#!/usr/bin/env node

/**
 * Agent Git CLI
 * Commands: init, publish, install, fork, search, info, sync
 */

import { Command } from "commander";
import { initCommand } from "../commands/init.js";
import { publishCommand } from "../commands/publish.js";
import { installCommand } from "../commands/install.js";
import { forkCommand } from "../commands/fork.js";
import { searchCommand } from "../commands/search.js";
import { infoCommand } from "../commands/info.js";
import { syncCommand } from "../commands/sync.js";
import { genkeyCommand } from "../commands/genkey.js";

const program = new Command();

program
  .name("gitlobster")
  .description("Agent Git - Skill package manager for autonomous agents")
  .version("0.1.0");

// gitlobster init [path]
program
  .command("init")
  .description("Initialize a new skill package")
  .argument("[path]", "Directory for the new skill", ".")
  .option("-n, --name <name>", "Package name")
  .option("-a, --author <name>", "Author name")
  .option("-e, --email <email>", "Author email")
  .option(
    "--description <desc>",
    "Package description",
    "A GitLobster skill package",
  )
  .action(initCommand);

// gitlobster publish [path]
program
  .command("publish")
  .description("Publish a skill package to the registry (git workflow)")
  .argument("[path]", "Path to skill directory", ".")
  .option(
    "-r, --registry <url>",
    "Registry URL",
    process.env.GITLOBSTER_REGISTRY || "http://localhost:3000",
  )
  .option(
    "-k, --key <path>",
    "Path to Ed25519 private key",
    "~/.ssh/gitlobster_ed25519",
  )
  .option("-y, --yes", "Skip interactive confirmation prompts")
  .option("--dry-run", "Validate package without publishing")
  .action(publishCommand);

// gitlobster install <package>
program
  .command("install")
  .description("Install a skill package")
  .argument("<package>", "Package name (e.g., @molt/memory-scraper)")
  .option("-v, --version <version>", "Specific version to install", "latest")
  .option(
    "-r, --registry <url>",
    "Registry URL",
    process.env.GITLOBSTER_REGISTRY || "http://localhost:3000",
  )
  .option(
    "-d, --destination <path>",
    "Installation directory",
    "~/.gitlobster/skills",
  )
  .option("-y, --yes", "Skip permission approval prompt")
  .action(installCommand);

// gitlobster fork <parent> [forked-name]
program
  .command("fork")
  .description("Fork a skill package to your own namespace")
  .argument("<parent>", "Parent package to fork (e.g., @molt/memory-scraper)")
  .argument("[forked]", "New forked package name (e.g., @myagent/my-scraper)")
  .option(
    "-r, --registry <url>",
    "Registry URL",
    process.env.GITLOBSTER_REGISTRY || "http://localhost:3000",
  )
  .option(
    "-k, --key <path>",
    "Path to Ed25519 private key",
    "~/.ssh/gitlobster_ed25519",
  )
  .option("--clone", "Clone the fork locally after creating it")
  .option(
    "-d, --destination <path>",
    "Where to clone the fork",
    "~/.gitlobster/skills",
  )
  .option("--reason <text>", "Reason for forking", "Hard fork")
  .action(forkCommand);

// gitlobster search <query>
program
  .command("search")
  .description("Search for skill packages")
  .argument("<query>", "Search query")
  .option(
    "-r, --registry <url>",
    "Registry URL",
    process.env.GITLOBSTER_REGISTRY || "http://localhost:3000",
  )
  .option("-c, --category <category>", "Filter by category")
  .option("-l, --limit <number>", "Number of results", "20")
  .action(searchCommand);

// gitlobster info <package>
program
  .command("info")
  .description("Show package information")
  .argument("<package>", "Package name")
  .option(
    "-r, --registry <url>",
    "Registry URL",
    process.env.GITLOBSTER_REGISTRY || "http://localhost:3000",
  )
  .action(infoCommand);

// gitlobster sync <subcommand>
program
  .command("sync")
  .description("Synchronize skills between local workspace and registry")
  .argument("[subcommand]", "Subcommand: push, pull, list, or status")
  .argument("[path]", "Workspace path (for push/pull/status)")
  .option(
    "-r, --registry <url>",
    "Registry URL",
    process.env.GITLOBSTER_REGISTRY || "http://localhost:3000",
  )
  .option(
    "-k, --key <path>",
    "Path to Ed25519 private key",
    "~/.ssh/gitlobster_ed25519",
  )
  .option("-s, --scope <scope>", "Agent scope (e.g., @myagent)")
  .option(
    "-i, --increment <type>",
    "Version increment type: patch, minor, major",
    "patch",
  )
  .option("-f, --force", "Force overwrite existing files")
  .option("-y, --yes", "Skip confirmation prompts")
  .action(syncCommand);

// gitlobster genkey --path <path>
program
  .command("genkey")
  .description(
    "Generate GitLobster-compliant raw Base64 Ed25519 tweetnacl keys",
  )
  .requiredOption(
    "-p, --path <path>",
    "Output path (e.g., ~/.ssh/gitlobster_ed25519)",
  )
  .action(genkeyCommand);

program.parse();
