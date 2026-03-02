<script setup>
import { getDaysAgo } from '../../../utils/dateUtils';

const props = defineProps({
  repo: { type: Object, required: true },
  selectedVersion: { type: String, required: true },
  availableVersions: { type: Array, required: true },
  getPerms: { type: Function, required: true },
  hasPerms: { type: Function, required: true },
  getEndorsements: { type: Function, required: true },
  getTrustDecayClass: { type: Function, required: true },
});

const emit = defineEmits(['update:selectedVersion', 'load-version', 'view-file', 'download']);

const viewRawManifest = () => {
  try {
    const manifestVersion = props.repo.versions?.find(v => v.version === props.selectedVersion);
    const content = JSON.stringify(JSON.parse(manifestVersion?.manifest || '{}'), null, 2);
    emit('view-file', { content, filename: 'manifest.json' });
  } catch (e) {
    emit('view-file', { content: '{}', filename: 'manifest.json' });
  }
};
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- File Browser (Left 2/3) -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Version/Branch Bar -->
      <div class="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
        <div class="flex items-center gap-3">
          <select :value="selectedVersion"
            @change="$emit('update:selectedVersion', $event.target.value); $emit('load-version')"
            class="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
            <option v-for="v in availableVersions" :key="v.version" :value="v.version">
              {{ v.version }} ({{ new Date(v.published_at).toLocaleDateString() }})
            </option>
          </select>
          <span class="text-zinc-500 text-sm">{{ selectedVersion === availableVersions[0]?.version ? 'Latest stable' : '' }}</span>
        </div>
      </div>

      <!-- File Tree -->
      <div class="bg-card border border-zinc rounded-xl overflow-hidden">
        <div class="border-b border-zinc-800 px-4 py-3 bg-zinc-900/50">
          <span class="text-sm font-bold text-zinc-400">📁 Files</span>
        </div>
        <div class="divide-y divide-zinc-800/50">
          <div class="px-4 py-3 hover:bg-zinc-900/50 cursor-pointer flex items-center justify-between group">
            <div class="flex items-center gap-3">
              <span class="text-zinc-500">📄</span>
              <span class="font-medium group-hover:text-orange-400 transition-colors">manifest.json</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-xs text-zinc-600 uppercase font-bold tracking-wider">Required</span>
              <button @click="viewRawManifest"
                class="text-xs px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300 transition-colors">
                View Raw
              </button>
            </div>
          </div>

          <div class="px-4 py-3 hover:bg-zinc-900/50 cursor-pointer flex items-center justify-between group">
            <div class="flex items-center gap-3">
              <span class="text-zinc-500">📄</span>
              <span class="font-medium group-hover:text-orange-400 transition-colors">SKILL.md</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-xs text-zinc-600 uppercase font-bold tracking-wider">Required</span>
              <a :href="`/v1/packages/${encodeURIComponent(repo.name)}/${selectedVersion}/skill-doc`"
                target="_blank"
                class="text-xs px-2 py-1 bg-zinc-800 hover:bg-orange-900/40 hover:text-orange-400 border border-transparent hover:border-orange-500/30 rounded text-zinc-300 transition-colors flex items-center gap-1">
                <span>↗</span> View Raw
              </a>
            </div>
          </div>

          <div class="px-4 py-3 hover:bg-zinc-900/50 cursor-pointer flex items-center justify-between group">
            <div class="flex items-center gap-3">
              <span class="text-zinc-500">📄</span>
              <span class="font-medium group-hover:text-orange-400 transition-colors">README.md</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-xs text-zinc-600">Documentation</span>
              <a :href="`/v1/packages/${encodeURIComponent(repo.name)}/${selectedVersion}/readme`"
                target="_blank"
                class="text-xs px-2 py-1 bg-zinc-800 hover:bg-orange-900/40 hover:text-orange-400 border border-transparent hover:border-orange-500/30 rounded text-zinc-300 transition-colors flex items-center gap-1">
                <span>↗</span> View Raw
              </a>
            </div>
          </div>

          <div class="px-4 py-3 hover:bg-zinc-900/50 cursor-pointer flex items-center justify-between group">
            <div class="flex items-center gap-3">
              <span class="text-amber-500">📁</span>
              <span class="font-medium group-hover:text-orange-400 transition-colors">src/</span>
            </div>
            <span class="text-xs text-zinc-600">Source Code</span>
          </div>
        </div>
      </div>

      <!-- Quick Install Card -->
      <div class="bg-card border border-zinc rounded-xl overflow-hidden mt-6">
        <div class="border-b border-zinc-800 px-4 py-3 bg-zinc-900/50 flex items-center justify-between">
          <span class="text-sm font-bold text-zinc-400">⚡ Quick Install</span>
        </div>
        <div class="p-6 space-y-4">
          <p class="text-xs text-zinc-500 uppercase tracking-widest">One-line installation command:</p>
          <pre class="bg-black/50 border border-zinc-800 rounded-lg p-4 text-sm mono text-emerald-400">botkit install @{{ repo.author_name || 'author' }}/{{ repo.name }}</pre>
        </div>
      </div>
    </div>

    <!-- Trust Stack Sidebar (Right 1/3) -->
    <div class="space-y-6">
      <!-- Trust Stack Panel -->
      <div class="bg-card border border-zinc rounded-xl overflow-hidden">
        <div class="border-b border-zinc-800 px-4 py-3 bg-zinc-900/50">
          <span class="text-sm font-bold text-zinc-400">🛡️ Trust Stack</span>
        </div>
        <div class="p-4 space-y-3">
          <div class="trust-stack space-y-2 mono text-xs">
            <div class="flex items-center gap-2">
              <span class="trust-fact-crypto">✔</span>
              <span class="trust-fact-crypto">Signature Valid</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="trust-fact-crypto">✔</span>
              <span class="trust-fact-crypto">Immutable Version</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="trust-fact-crypto">✔</span>
              <span class="trust-fact-crypto">Permissions Declared</span>
            </div>
            <div v-if="getPerms(repo).network" class="flex items-center gap-2">
              <span class="trust-signal-behavioral">⚠</span>
              <span class="trust-signal-behavioral">External Network</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="trust-signal-behavioral">✔</span>
              <span class="trust-signal-behavioral">{{ getEndorsements(repo) }} Endorsements</span>
            </div>
            <div class="flex items-center gap-2">
              <span :class="getTrustDecayClass(repo)">{{ getDaysAgo(repo) < 30 ? '✔' : '⚠' }}</span>
              <span :class="getTrustDecayClass(repo)">Verified {{ getDaysAgo(repo) }}d ago</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Permissions Panel -->
      <div class="bg-card border border-zinc rounded-xl overflow-hidden">
        <div class="border-b border-zinc-800 px-4 py-3 bg-zinc-900/50">
          <span class="text-sm font-bold text-zinc-400">🔐 Permissions</span>
        </div>
        <div class="p-4 space-y-2">
          <template v-if="getPerms(repo).filesystem">
            <div v-if="getPerms(repo).filesystem.read" class="flex items-center gap-2 text-sm">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              <span class="text-zinc-300">Filesystem Read</span>
            </div>
            <div v-if="getPerms(repo).filesystem.write" class="flex items-center gap-2 text-sm">
              <span class="w-2 h-2 rounded-full bg-pink-500"></span>
              <span class="text-zinc-300">Filesystem Write</span>
            </div>
          </template>
          <div v-if="getPerms(repo).network" class="flex items-center gap-2 text-sm">
            <span class="w-2 h-2 rounded-full bg-red-500"></span>
            <span class="text-zinc-300">Network Access</span>
          </div>
          <div v-if="getPerms(repo).env" class="flex items-center gap-2 text-sm">
            <span class="w-2 h-2 rounded-full bg-purple-500"></span>
            <span class="text-zinc-300">Environment Variables</span>
          </div>
          <div v-if="!hasPerms(repo)" class="text-sm text-zinc-500 italic">
            No permissions required
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
