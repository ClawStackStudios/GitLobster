<script setup>
import { getDaysAgo } from '../../../utils/dateUtils';

const props = defineProps({
  repo: { type: Object, required: true },
  availableVersions: { type: Array, required: true },
  getLatestVersion: { type: String, required: true },
  // Diff state from useVersionDiff composable
  diffViewMode: { type: String, required: true },
  selectedCompareVersion: { type: String, default: '' },
  versionDiffs: { type: Object, required: true },
  loadingDiffs: { type: Object, required: true },
  expandedEvolutionDiffs: { type: Object, required: true },
  evolutionPage: { type: Number, default: 1 },
  // Methods from useVersionDiff composable
  getEvolutionPairs: { type: Function, required: true },
  getEvolutionDiff: { type: Function, required: true },
});

const emit = defineEmits([
  'update:diffViewMode',
  'update:selectedCompareVersion',
  'update:evolutionPage',
  'load-version-diff',
  'load-evolution-diff',
  'toggle-evolution-expand',
]);
</script>

<template>
  <div class="max-w-5xl">
    <!-- Mode Toggle Header -->
    <div class="flex gap-2 mb-6">
      <button @click="$emit('update:diffViewMode', 'compare-to-current')"
        :class="diffViewMode === 'compare-to-current' ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'"
        class="px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
        <span>📊</span> Compare to Current
      </button>
      <button @click="$emit('update:diffViewMode', 'evolution')"
        :class="diffViewMode === 'evolution' ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'"
        class="px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
        <span>🔄</span> Version Evolution
      </button>
    </div>

    <!-- MODE 1: Compare to Current -->
    <div v-if="diffViewMode === 'compare-to-current'" class="space-y-6">
      <!-- Current Version Header -->
      <div class="bg-card border border-zinc rounded-xl p-4">
        <div class="flex items-center gap-3">
          <div class="flex-1">
            <div class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Current Version</div>
            <div class="text-xl font-bold mt-1">v{{ getLatestVersion }}</div>
            <div class="text-xs text-zinc-500 mt-1" v-if="repo?.published_at">
              Published {{ getDaysAgo({ createdAt: repo.published_at }) }} days ago
            </div>
          </div>
          <div class="text-4xl text-orange-500/30">→</div>
        </div>
      </div>

      <!-- Version List -->
      <div class="bg-card border border-zinc rounded-xl overflow-hidden">
        <div class="border-b border-zinc px-4 py-3 bg-zinc-900/50">
          <span class="text-sm font-bold text-zinc-400">Select Version to Compare</span>
        </div>
        <div class="divide-y divide-zinc max-h-64 overflow-y-auto">
          <button v-for="(v, idx) in availableVersions.slice(1)" :key="v.version"
            @click="$emit('update:selectedCompareVersion', v.version); $emit('load-version-diff', v.version)"
            :class="selectedCompareVersion === v.version ? 'bg-zinc-800/50' : 'hover:bg-zinc-800/30'"
            class="w-full text-left px-4 py-3 transition-colors flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-zinc-500">{{ idx + 1 }}</span>
              <div>
                <div class="font-bold">v{{ v.version }}</div>
                <div class="text-xs text-zinc-500">{{ new Date(v.published_at).toLocaleDateString() }}</div>
              </div>
            </div>
            <span v-if="selectedCompareVersion === v.version" class="text-orange-500 font-bold">→</span>
          </button>
        </div>
      </div>

      <!-- Diff Display -->
      <div v-if="selectedCompareVersion">
        <div v-if="loadingDiffs.has(selectedCompareVersion)" class="text-center py-8 text-zinc-500">
          <span class="animate-pulse">Fetching diff...</span>
        </div>
        <div v-else-if="versionDiffs[selectedCompareVersion]">
          <div class="space-y-6">
            <!-- Summary Header -->
            <div class="bg-card border border-zinc rounded-xl p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="text-lg font-bold">v{{ repo?.latest_version }} → v{{ selectedCompareVersion }}</span>
                  <span :class="versionDiffs[selectedCompareVersion].riskLevel === 'high' ? 'bg-red-500/20 text-red-400' : versionDiffs[selectedCompareVersion].riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'"
                    class="px-2 py-1 rounded text-xs font-bold uppercase">{{ versionDiffs[selectedCompareVersion].riskLevel }} Risk</span>
                </div>
                <span class="text-sm text-zinc-500">{{ versionDiffs[selectedCompareVersion].changeCount }} changes</span>
              </div>
            </div>

            <!-- Permission Changes -->
            <div class="bg-card border border-zinc rounded-xl p-4" v-if="versionDiffs[selectedCompareVersion].permissions">
              <h4 class="font-bold mb-3 flex items-center gap-2"><span>🔐</span> Permission Changes</h4>
              <div class="space-y-2">
                <div v-if="versionDiffs[selectedCompareVersion].permissions.added?.length" class="space-y-1">
                  <div class="text-xs font-bold text-emerald-400 uppercase">Added</div>
                  <div v-for="perm in versionDiffs[selectedCompareVersion].permissions.added" :key="perm"
                    class="text-sm bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-1">+ {{ perm }}</div>
                </div>
                <div v-if="versionDiffs[selectedCompareVersion].permissions.removed?.length" class="space-y-1 mt-3">
                  <div class="text-xs font-bold text-zinc-500 uppercase">Removed</div>
                  <div v-for="perm in versionDiffs[selectedCompareVersion].permissions.removed" :key="perm"
                    class="text-sm bg-zinc-800/50 border border-zinc-700 rounded px-2 py-1">- {{ perm }}</div>
                </div>
              </div>
            </div>

            <!-- File Changes -->
            <div class="bg-card border border-zinc rounded-xl p-4" v-if="versionDiffs[selectedCompareVersion].files">
              <h4 class="font-bold mb-3 flex items-center gap-2">
                <span>📝</span> File Changes ({{ versionDiffs[selectedCompareVersion].files.length }})
              </h4>
              <div class="space-y-1">
                <div v-for="(file, idx) in versionDiffs[selectedCompareVersion].files.slice(0, 5)" :key="file"
                  class="text-sm flex items-center gap-2 px-2 py-1"
                  :class="file[0] === '+' ? 'text-emerald-400' : file[0] === '-' ? 'text-red-400' : 'text-yellow-400'">
                  <span class="font-bold w-6">{{ file[0] }}</span>
                  <span class="mono text-xs">{{ file.slice(1) }}</span>
                </div>
                <div v-if="versionDiffs[selectedCompareVersion].files.length > 5"
                  class="text-xs text-zinc-500 px-2 py-2">
                  ... and {{ versionDiffs[selectedCompareVersion].files.length - 5 }} more files
                </div>
              </div>
            </div>

            <!-- Metadata Changes -->
            <div class="bg-card border border-zinc rounded-xl p-4" v-if="versionDiffs[selectedCompareVersion].metadata">
              <h4 class="font-bold mb-3 flex items-center gap-2"><span>ℹ️</span> Metadata Changes</h4>
              <div class="space-y-3">
                <div v-if="versionDiffs[selectedCompareVersion].metadata.description" class="space-y-1">
                  <div class="text-xs font-bold text-zinc-400">Description</div>
                  <div class="text-sm text-zinc-500 line-through">{{ versionDiffs[selectedCompareVersion].metadata.description.before }}</div>
                  <div class="text-sm text-emerald-400">{{ versionDiffs[selectedCompareVersion].metadata.description.after }}</div>
                </div>
                <div v-if="versionDiffs[selectedCompareVersion].metadata.tags" class="space-y-1">
                  <div class="text-xs font-bold text-zinc-400">Tags</div>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="tag in versionDiffs[selectedCompareVersion].metadata.tags.added" :key="tag"
                      class="text-xs bg-emerald-500/20 text-emerald-400 rounded px-2 py-1">+ {{ tag }}</span>
                    <span v-for="tag in versionDiffs[selectedCompareVersion].metadata.tags.removed" :key="tag"
                      class="text-xs bg-zinc-800 text-zinc-500 rounded px-2 py-1">- {{ tag }}</span>
                  </div>
                </div>
                <div v-if="versionDiffs[selectedCompareVersion].metadata.changelog" class="space-y-1">
                  <div class="text-xs font-bold text-zinc-400">Changelog Entry</div>
                  <div class="text-sm bg-zinc-900/50 border border-zinc-800 rounded px-2 py-1 mono">
                    {{ versionDiffs[selectedCompareVersion].metadata.changelog }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODE 2: Version Evolution -->
    <div v-if="diffViewMode === 'evolution'" class="space-y-6">
      <div v-if="availableVersions && availableVersions.length > 1" class="space-y-4">
        <div v-for="(pair, idx) in getEvolutionPairs().slice((evolutionPage - 1) * 5, evolutionPage * 5)"
          :key="idx"
          class="bg-card border border-zinc rounded-xl overflow-hidden">
          <!-- Collapsible Header -->
          <button @click="$emit('toggle-evolution-expand', { pair, idx })"
            class="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-900/50 transition-colors border-b border-zinc"
            :class="expandedEvolutionDiffs.has(idx) ? 'bg-zinc-900/50' : ''">
            <div class="flex items-center gap-3">
              <span class="text-lg">{{ expandedEvolutionDiffs.has(idx) ? '▼' : '▶' }}</span>
              <div class="text-left">
                <div class="font-bold">v{{ pair.from }} → v{{ pair.to }}</div>
                <div class="text-xs text-zinc-500">
                  {{ pair.from_date ? new Date(pair.from_date).toLocaleDateString() : 'N/A' }} to {{ pair.to_date ? new Date(pair.to_date).toLocaleDateString() : 'N/A' }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2" v-if="loadingDiffs.has(pair._diffKey)">
              <span class="text-xs text-zinc-500 animate-pulse">Loading...</span>
            </div>
            <div class="flex items-center gap-2" v-else-if="getEvolutionDiff(pair)">
              <span :class="getEvolutionDiff(pair)?.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' : getEvolutionDiff(pair)?.riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'"
                class="px-2 py-1 rounded text-xs font-bold uppercase">{{ getEvolutionDiff(pair)?.riskLevel }}</span>
            </div>
          </button>

          <!-- Expanded Content -->
          <div v-if="expandedEvolutionDiffs.has(idx)" class="p-4 space-y-3">
            <div v-if="loadingDiffs.has(pair._diffKey)" class="text-center py-4 text-zinc-500">
              <span class="animate-pulse">Loading diff...</span>
            </div>

            <template v-else-if="getEvolutionDiff(pair)">
              <!-- Permission Changes -->
              <div v-if="getEvolutionDiff(pair)?.permissions && (getEvolutionDiff(pair).permissions.added?.length || getEvolutionDiff(pair).permissions.removed?.length)" class="space-y-2">
                <h5 class="text-sm font-bold text-zinc-400">Permission Changes</h5>
                <div v-if="getEvolutionDiff(pair).permissions.added?.length" class="space-y-1">
                  <div v-for="perm in getEvolutionDiff(pair).permissions.added" :key="perm"
                    class="text-xs bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-1">+ {{ perm }}</div>
                </div>
                <div v-if="getEvolutionDiff(pair).permissions.removed?.length" class="space-y-1">
                  <div v-for="perm in getEvolutionDiff(pair).permissions.removed" :key="perm"
                    class="text-xs bg-zinc-800/50 border border-zinc-700 rounded px-2 py-1">- {{ perm }}</div>
                </div>
              </div>

              <!-- File Changes -->
              <div v-if="getEvolutionDiff(pair)?.files?.length" class="space-y-2">
                <h5 class="text-sm font-bold text-zinc-400">Files Changed ({{ getEvolutionDiff(pair).files.length }})</h5>
                <div v-for="file in getEvolutionDiff(pair).files.slice(0, 5)" :key="file"
                  class="text-xs flex items-center gap-2"
                  :class="file[0] === '+' ? 'text-emerald-400' : file[0] === '-' ? 'text-red-400' : 'text-yellow-400'">
                  <span class="font-bold w-4">{{ file[0] }}</span>
                  <span class="mono">{{ file.slice(2) }}</span>
                </div>
                <div v-if="getEvolutionDiff(pair).files.length > 5" class="text-xs text-zinc-500 mt-2">
                  ... and {{ getEvolutionDiff(pair).files.length - 5 }} more files
                </div>
              </div>

              <!-- Metadata Changes -->
              <div v-if="getEvolutionDiff(pair)?.metadata" class="space-y-2">
                <h5 class="text-sm font-bold text-zinc-400">Metadata Changes</h5>
                <div v-if="getEvolutionDiff(pair).metadata.description" class="text-xs">
                  <div class="text-zinc-500 line-through">{{ getEvolutionDiff(pair).metadata.description.before }}</div>
                  <div class="text-emerald-400">{{ getEvolutionDiff(pair).metadata.description.after }}</div>
                </div>
                <div v-if="getEvolutionDiff(pair).metadata.tags" class="flex flex-wrap gap-1">
                  <span v-for="tag in getEvolutionDiff(pair).metadata.tags.added" :key="tag"
                    class="text-xs bg-emerald-500/20 text-emerald-400 rounded px-1.5 py-0.5">+ {{ tag }}</span>
                  <span v-for="tag in getEvolutionDiff(pair).metadata.tags.removed" :key="tag"
                    class="text-xs bg-zinc-800 text-zinc-500 rounded px-1.5 py-0.5">- {{ tag }}</span>
                </div>
              </div>
            </template>

            <div v-else class="text-center py-4 text-zinc-500 text-sm">No diff data available</div>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div v-if="getEvolutionPairs().length > 5" class="flex items-center justify-center gap-4 py-4">
          <button @click="$emit('update:evolutionPage', Math.max(1, evolutionPage - 1))"
            :disabled="evolutionPage === 1"
            class="px-3 py-1 rounded-lg text-sm font-bold transition-colors"
            :class="evolutionPage === 1 ? 'text-zinc-600 cursor-not-allowed' : 'text-white hover:bg-zinc-800'">
            ← Prev
          </button>
          <span class="text-sm text-zinc-400">
            Page {{ evolutionPage }} of {{ Math.ceil(getEvolutionPairs().length / 5) }}
          </span>
          <button @click="$emit('update:evolutionPage', Math.min(Math.ceil(getEvolutionPairs().length / 5), evolutionPage + 1))"
            :disabled="evolutionPage >= Math.ceil(getEvolutionPairs().length / 5)"
            class="px-3 py-1 rounded-lg text-sm font-bold transition-colors"
            :class="evolutionPage >= Math.ceil(getEvolutionPairs().length / 5) ? 'text-zinc-600 cursor-not-allowed' : 'text-white hover:bg-zinc-800'">
            Next →
          </button>
        </div>
      </div>

      <div v-else class="text-center py-8 text-zinc-500">No version history available</div>
    </div>
  </div>
</template>
