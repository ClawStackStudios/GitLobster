#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, resolve } from "path";
import chalk from "chalk";
import ora from "ora";

/**
 * Documentation Commands for GitLobster CLI
 * 
 * Commands:
 * - docs serve: Start local docs development server
 * - docs build: Build production docs
 * - docs init: Initialize docs structure for a skill
 * - docs new: Create new documentation page
 */

export async function docsCommand(action, options = {}) {
  const { registryUrl = process.env.GITLOBSTER_REGISTRY || "http://localhost:3000" } = options;

  switch (action) {
    case "serve":
      await serveDocs(registryUrl);
      break;
    case "build":
      await buildDocs(registryUrl);
      break;
    case "init":
      await initDocs(options);
      break;
    case "new":
      await newDoc(options);
      break;
    default:
      console.log(chalk.red("Unknown docs action. Use: serve, build, init, or new"));
      process.exit(1);
  }
}

/**
 * Start local documentation development server
 */
async function serveDocs(registryUrl) {
  const spinner = ora("Starting documentation server...").start();
  
  try {
    // Check if docs directory exists
    const docsDir = resolve(process.cwd(), "docs");
    if (!existsSync(docsDir)) {
      spinner.fail("No docs directory found. Run 'gitlobster docs init' first.");
      process.exit(1);
    }

    // Check if Vite is available
    const hasVite = checkViteAvailable();
    if (!hasVite) {
      spinner.fail("Vite not found. Install with: npm install -g vite");
      process.exit(1);
    }

    spinner.succeed("Documentation server ready!");
    console.log(chalk.green(`\nLocal server: http://localhost:5173`));
    console.log(chalk.blue(`Registry API: ${registryUrl}`));
    console.log(chalk.yellow("\nPress Ctrl+C to stop\n"));

    // Start Vite dev server
    execFileSync("npx", ["vite"], {
      cwd: docsDir, 
      stdio: "inherit",
      env: { ...process.env, GITLOBSTER_REGISTRY: registryUrl }
    });

  } catch (error) {
    spinner.fail("Failed to start documentation server");
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

/**
 * Build production documentation
 */
async function buildDocs(registryUrl) {
  const spinner = ora("Building documentation...").start();
  
  try {
    const docsDir = resolve(process.cwd(), "docs");
    if (!existsSync(docsDir)) {
      spinner.fail("No docs directory found. Run 'gitlobster docs init' first.");
      process.exit(1);
    }

    // Check if Vite is available
    const hasVite = checkViteAvailable();
    if (!hasVite) {
      spinner.fail("Vite not found. Install with: npm install -g vite");
      process.exit(1);
    }

    // Build the docs
    execFileSync("npx", ["vite", "build"], {
      cwd: docsDir, 
      stdio: "inherit",
      env: { ...process.env, GITLOBSTER_REGISTRY: registryUrl }
    });

    spinner.succeed("Documentation built successfully!");
    console.log(chalk.green(`\nBuilt files in: ${docsDir}/dist`));
    console.log(chalk.blue("Deploy the 'dist' directory to your web server"));

  } catch (error) {
    spinner.fail("Failed to build documentation");
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

/**
 * Initialize documentation structure for a skill
 */
async function initDocs(options) {
  const { force = false } = options;
  const spinner = ora("Initializing documentation structure...").start();
  
  try {
    const docsDir = resolve(process.cwd(), "docs");
    
    if (existsSync(docsDir) && !force) {
      spinner.warn("Docs directory already exists. Use --force to overwrite.");
      process.exit(1);
    }

    // Create docs structure
    createDocsStructure(docsDir);
    
    // Create package.json for docs
    createDocsPackageJson(docsDir);
    
    // Create Vite config
    createViteConfig(docsDir);
    
    // Create main documentation files
    createDocumentationFiles(docsDir);

    spinner.succeed("Documentation structure initialized!");
    console.log(chalk.green(`\nDocs created in: ${docsDir}`));
    console.log(chalk.yellow("\nNext steps:"));
    console.log(chalk.blue("  cd docs && npm install"));
    console.log(chalk.blue("  gitlobster docs serve"));
    console.log(chalk.blue("  gitlobster docs build"));

  } catch (error) {
    spinner.fail("Failed to initialize documentation");
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

/**
 * Create new documentation page
 */
async function newDoc(options) {
  const { title, category = "general" } = options;
  
  if (!title) {
    console.log(chalk.red("Please provide a title for the new documentation page"));
    console.log(chalk.yellow("Usage: gitlobster docs new --title 'Page Title' [--category category]"));
    process.exit(1);
  }

  const spinner = ora(`Creating documentation page: ${title}...`).start();
  
  try {
    const docsDir = resolve(process.cwd(), "docs");
    if (!existsSync(docsDir)) {
      spinner.fail("No docs directory found. Run 'gitlobster docs init' first.");
      process.exit(1);
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const pagePath = join(docsDir, "src", "pages", `${slug}.md`);
    
    const content = `---
title: "${title}"
category: ${category}
date: ${new Date().toISOString().split('T')[0]}
---

# ${title}

## Overview

[Add overview content here]

## Usage

\`\`\`javascript
// Example usage
\`\`\`

## Configuration

[Add configuration options]

## Examples

[Add code examples]

## API Reference

[Add API documentation]

## See Also

- [Related documentation](./other-page.md)
`;

    writeFileSync(pagePath, content);
    
    // Update navigation if nav.json exists
    updateNavigation(docsDir, title, slug, category);

    spinner.succeed(`Documentation page created: ${pagePath}`);
    console.log(chalk.green(`\nEdit the file: ${pagePath}`));
    console.log(chalk.blue("Run 'gitlobster docs serve' to preview"));

  } catch (error) {
    spinner.fail("Failed to create documentation page");
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// Helper functions

function checkViteAvailable() {
  try {
    execFileSync("npx", ["vite", "--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function createDocsStructure(docsDir) {
  const dirs = [
    "src",
    "src/assets",
    "src/components",
    "src/pages",
    "src/styles"
  ];

  dirs.forEach(dir => {
    const fullPath = join(docsDir, dir);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
    }
  });
}

function createDocsPackageJson(docsDir) {
  const packageJson = {
    "name": "skill-docs",
    "version": "1.0.0",
    "private": true,
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview"
    },
    "dependencies": {
      "vue": "^3.4.0",
      "vue-router": "^4.2.0"
    },
    "devDependencies": {
      "@vitejs/plugin-vue": "^5.0.0",
      "vite": "^5.0.0"
    }
  };

  writeFileSync(join(docsDir, "package.json"), JSON.stringify(packageJson, null, 2));
}

function createViteConfig(docsDir) {
  const config = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    minify: 'terser'
  }
})
`;

  writeFileSync(join(docsDir, "vite.config.js"), config);
}

function createDocumentationFiles(docsDir) {
  // Main App.vue
  const appContent = `<template>
  <div id="app">
    <nav class="navbar">
      <div class="container">
        <h1>GitLobster Documentation</h1>
        <div class="nav-links">
          <router-link to="/">Home</router-link>
          <router-link to="/guide">Guide</router-link>
          <router-link to="/api">API</router-link>
        </div>
      </div>
    </nav>
    
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
// App component
</script>

<style>
:root {
  --primary-color: #007bff;
  --bg-color: #0f172a;
  --text-color: #e2e8f0;
  --card-bg: #1e293b;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.navbar {
  background: var(--card-bg);
  border-bottom: 1px solid #334155;
  padding: 1rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--primary-color);
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: var(--primary-color);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.router-link-active {
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
}
</style>
`;

  writeFileSync(join(docsDir, "src", "App.vue"), appContent);

  // Router
  const routerContent = `import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import Guide from './pages/Guide.vue'
import API from './pages/API.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/guide', component: Guide },
  { path: '/api', component: API }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
`;

  writeFileSync(join(docsDir, "src", "router.js"), routerContent);

  // Home page
  const homeContent = `<template>
  <div class="home">
    <div class="hero">
      <h1>{{ title }}</h1>
      <p class="description">{{ description }}</p>
      <div class="cta-buttons">
        <button class="btn-primary" @click="$router.push('/guide')">
          Get Started
        </button>
        <button class="btn-secondary" @click="$router.push('/api')">
          View API
        </button>
      </div>
    </div>

    <div class="features">
      <div class="feature-card">
        <h3>🚀 Quick Start</h3>
        <p>Get up and running in minutes with our comprehensive guide.</p>
      </div>
      <div class="feature-card">
        <h3>📚 Complete Documentation</h3>
        <p>Everything you need to know about using this skill.</p>
      </div>
      <div class="feature-card">
        <h3>🔧 API Reference</h3>
        <p>Detailed API documentation with examples and usage patterns.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const title = "Skill Documentation"
const description = "Comprehensive documentation for this GitLobster skill package."
</script>

<style scoped>
.home {
  text-align: center;
}

.hero {
  margin-bottom: 4rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.description {
  font-size: 1.2rem;
  color: #94a3b8;
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 4rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: var(--text-color);
  border: 1px solid #334155;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #334155;
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-card h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.feature-card p {
  color: #94a3b8;
  line-height: 1.6;
}
</style>
`;

  writeFileSync(join(docsDir, "src", "pages", "Home.vue"), homeContent);

  // Guide page
  const guideContent = `<template>
  <div class="guide">
    <h1>Getting Started Guide</h1>
    <div class="guide-content">
      <div class="guide-section">
        <h2>Installation</h2>
        <pre><code>npm install @your-namespace/your-skill</code></pre>
      </div>
      
      <div class="guide-section">
        <h2>Basic Usage</h2>
        <pre><code>// Import and use the skill
import { yourFunction } from '@your-namespace/your-skill';

const result = await yourFunction(options);</code></pre>
      </div>
      
      <div class="guide-section">
        <h2>Configuration</h2>
        <p>Configure the skill with options:</p>
        <pre><code>const config = {
  apiKey: 'your-api-key',
  timeout: 5000,
  retries: 3
};</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
// Guide component
</script>

<style scoped>
.guide h1 {
  text-align: center;
  margin-bottom: 3rem;
}

.guide-content {
  max-width: 800px;
  margin: 0 auto;
}

.guide-section {
  margin-bottom: 3rem;
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #334155;
}

.guide-section h2 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

pre {
  background: #0b1220;
  padding: 1.5rem;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid #1e293b;
}

code {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 0.9rem;
  color: #e2e8f0;
}
</style>
`;

  writeFileSync(join(docsDir, "src", "pages", "Guide.vue"), guideContent);

  // API page
  const apiContent = `<template>
  <div class="api">
    <h1>API Reference</h1>
    <div class="api-content">
      <div class="api-section">
        <h2>Functions</h2>
        <div class="api-item">
          <h3>yourFunction(options)</h3>
          <p>Primary function of this skill.</p>
          <div class="api-params">
            <h4>Parameters:</h4>
            <ul>
              <li><strong>options</strong> (Object) - Configuration options</li>
            </ul>
          </div>
          <div class="api-returns">
            <h4>Returns:</h4>
            <p>Promise&lt;Result&gt; - The result of the operation</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// API component
</script>

<style scoped>
.api h1 {
  text-align: center;
  margin-bottom: 3rem;
}

.api-content {
  max-width: 800px;
  margin: 0 auto;
}

.api-section {
  margin-bottom: 3rem;
}

.api-item {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #334155;
  margin-bottom: 1rem;
}

.api-item h3 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.api-params, .api-returns {
  margin-top: 1rem;
}

.api-params h4, .api-returns h4 {
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.api-params ul {
  list-style: none;
  padding-left: 0;
}

.api-params li {
  background: #0b1220;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  border-left: 3px solid var(--primary-color);
}
</style>
`;

  writeFileSync(join(docsDir, "src", "pages", "API.vue"), apiContent);

  // Main entry point
  const mainContent = `import { createApp } from 'vue'
import { router } from './router.js'
import App from './App.vue'

const app = createApp(App)
app.use(router)
app.mount('#app')
`;

  writeFileSync(join(docsDir, "src", "main.js"), mainContent);

  // Index HTML
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Skill Documentation</title>
    <meta name="description" content="Documentation for this GitLobster skill package" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;

  writeFileSync(join(docsDir, "index.html"), htmlContent);
}

function updateNavigation(docsDir, title, slug, category) {
  const navPath = join(docsDir, "src", "nav.json");
  let nav = [];

  if (existsSync(navPath)) {
    try {
      nav = JSON.parse(readFileSync(navPath, 'utf-8'));
    } catch (e) {
      nav = [];
    }
  }

  // Add new page to navigation
  const newPage = {
    title,
    slug,
    category,
    path: `/docs/${slug}`
  };

  nav.push(newPage);
  
  // Sort by category then title
  nav.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.title.localeCompare(b.title);
  });

  writeFileSync(navPath, JSON.stringify(nav, null, 2));
}
