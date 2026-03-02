<script setup>
const props = defineProps({
  repo: { type: Object, required: true },
  lineageData: { type: Object, default: null },
  lineageLoading: { type: Boolean, default: false },
  lineageError: { type: String, default: null },
});
</script>

<template>
  <div class="space-y-6">
    <div class="bg-card border border-zinc rounded-xl overflow-hidden">
      <div class="border-b border-zinc-800 px-4 py-3 bg-zinc-900/50 flex items-center justify-between">
        <span class="text-sm font-bold text-zinc-400">🔗 Cryptographic Lineage</span>
        <span v-if="lineageData" class="text-xs text-zinc-500">
          {{ lineageData.trust?.totalForks || 0 }} forks • 
          {{ lineageData.trust?.verifiedSignatures || 0 }} verified
        </span>
      </div>

      <div v-if="lineageLoading" class="p-8 text-center">
        <span class="animate-pulse text-zinc-500">Loading lineage data...</span>
      </div>

      <div v-else-if="lineageError" class="p-8 text-center text-red-400">
        <p>Failed to load lineage: {{ lineageError }}</p>
      </div>

      <div v-else-if="lineageData" class="divide-y divide-zinc-800/50">
        <!-- Author Identity -->
        <div class="p-4">
          <h4 class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Original Author</h4>
          <div class="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              :class="lineageData.author?.publicKey ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-600'">
              {{ lineageData.author?.publicKey ? '🔐' : '❓' }}
            </div>
            <div class="flex-1">
              <div class="font-bold">{{ lineageData.author?.name }}</div>
              <div class="text-xs text-zinc-500 font-mono">{{ lineageData.author?.fingerprint }}</div>
            </div>
            <span :class="lineageData.author?.publicKey ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'"
              class="px-2 py-1 rounded text-xs font-bold">
              {{ lineageData.author?.publicKey ? 'VERIFIED' : 'UNVERIFIED' }}
            </span>
          </div>
        </div>

        <!-- Ancestors -->
        <div v-if="lineageData.ancestors?.length" class="p-4">
          <h4 class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">📜 Ancestors</h4>
          <div class="space-y-2">
            <div v-for="ancestor in lineageData.ancestors" :key="ancestor.package"
              class="flex items-center gap-4 p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
              <span class="text-orange-500">↓</span>
              <div class="flex-1">
                <div class="font-bold text-sm">{{ ancestor.package }}</div>
                <div class="text-xs text-zinc-500">Forked at v{{ ancestor.forkPointVersion }}</div>
              </div>
              <div class="flex items-center gap-2">
                <span :class="ancestor.signatureValid === true ? 'text-emerald-400' : (ancestor.signatureValid === false ? 'text-red-400' : 'text-zinc-500')"
                  class="text-xs">
                  {{ ancestor.signatureValid === true ? '✔ Verified' : (ancestor.signatureValid === false ? '✘ Invalid' : '? Unknown') }}
                </span>
                <span class="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400 font-mono">
                  {{ ancestor.author?.fingerprint }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Descendants -->
        <div v-if="lineageData.descendants?.length" class="p-4">
          <h4 class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">🔀 Forks ({{ lineageData.descendants.length }})</h4>
          <div class="space-y-2">
            <div v-for="descendant in lineageData.descendants" :key="descendant.package"
              class="flex items-center gap-4 p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50 hover:border-orange-500/30 transition-colors">
              <span class="text-purple-500">→</span>
              <div class="flex-1">
                <div class="font-bold text-sm">{{ descendant.package }}</div>
                <div class="text-xs text-zinc-500">
                  by @{{ descendant.forkerAgent }} • {{ descendant.forkReason }}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span :class="descendant.signatureValid === true ? 'text-emerald-400' : (descendant.signatureValid === false ? 'text-red-400' : 'text-amber-400')"
                  class="text-xs flex items-center gap-1">
                  <span v-if="descendant.signatureValid === true">✔</span>
                  <span v-else-if="descendant.signatureValid === false">✘</span>
                  <span v-else>⚠</span>
                  {{ descendant.signatureStatus }}
                </span>
                <span class="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400 font-mono">
                  {{ descendant.author?.fingerprint }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty lineage -->
        <div v-if="!lineageData.ancestors?.length && !lineageData.descendants?.length"
          class="p-8 text-center text-zinc-500">
          <div class="text-4xl mb-4 opacity-30">🔗</div>
          <p>No fork lineage recorded for this package.</p>
          <p class="text-xs mt-2">This package has not been forked and has no parent.</p>
        </div>
      </div>

      <div v-else class="p-8 text-center text-zinc-500">
        <div class="text-4xl mb-4 opacity-30">🔗</div>
        <p>Lineage data not available.</p>
      </div>
    </div>
  </div>
</template>
