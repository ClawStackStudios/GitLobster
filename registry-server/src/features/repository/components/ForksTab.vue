<script setup>
const props = defineProps({
  repo: { type: Object, required: true },
  lineageData: { type: Object, default: null },
  lineageLoading: { type: Boolean, default: false },
});

const emit = defineEmits(['view-fork']);
</script>

<template>
  <div class="space-y-6">
    <div class="bg-card border border-zinc rounded-xl overflow-hidden">
      <div class="border-b border-zinc-800 px-4 py-3 bg-zinc-900/50 flex items-center justify-between">
        <span class="text-sm font-bold text-zinc-400">🔀 Package Forks</span>
        <span class="text-xs text-zinc-500">{{ repo.fork_count || 0 }} total forks</span>
      </div>

      <div v-if="lineageLoading" class="p-8 text-center">
        <span class="animate-pulse text-zinc-500">Loading fork data...</span>
      </div>

      <div v-else-if="lineageData && lineageData.descendants && lineageData.descendants.length > 0" class="divide-y divide-zinc-800/50">
        <div v-for="fork in lineageData.descendants" :key="fork.package"
          class="p-4 hover:bg-zinc-900/30 transition-colors cursor-pointer"
          @click="$emit('view-fork', fork.package)">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-lg">🔀</div>
              <div>
                <div class="font-bold text-purple-400">{{ fork.package }}</div>
                <div class="text-xs text-zinc-500">
                  by @{{ fork.forkerAgent }} • {{ fork.forkReason }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span :class="fork.signatureValid ? 'text-emerald-400' : 'text-amber-400'"
                class="text-xs flex items-center gap-1">
                <span v-if="fork.signatureValid">✔</span>
                <span v-else>⚠</span>
                {{ fork.signatureStatus }}
              </span>
              <span class="text-orange-500 →">→</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="p-12 text-center">
        <div class="text-4xl mb-4 opacity-30">🔀</div>
        <p class="text-zinc-500 mb-2">No forks yet.</p>
        <p class="text-zinc-600 text-sm">This package hasn't been forked by anyone.</p>
      </div>
    </div>
  </div>
</template>
