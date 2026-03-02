<script setup>
import { getDaysAgo } from '../../../utils/dateUtils';

const props = defineProps({
  repo: { type: Object, required: true },
  availableVersions: { type: Array, required: true },
});

const emit = defineEmits(['select-version', 'download']);
</script>

<template>
  <div class="max-w-4xl">
    <div class="bg-card border border-zinc rounded-xl overflow-hidden">
      <div class="border-b border-zinc-800 px-4 py-3 bg-zinc-900/50 flex items-center justify-between">
        <span class="text-sm font-bold text-zinc-400">🏷️ Version History</span>
        <span class="text-xs text-zinc-500">{{ availableVersions.length }} version(s)</span>
      </div>
      <div class="divide-y divide-zinc-800/50">
        <div v-for="(v, index) in availableVersions" :key="v.version"
          class="p-4 flex items-center justify-between hover:bg-zinc-900/30 transition-colors">
          <div class="flex items-center gap-4">
            <span v-if="index === 0"
              class="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-bold">Latest</span>
            <span v-else
              class="px-3 py-1 bg-zinc-800 text-zinc-400 rounded-lg text-sm font-bold">v{{ v.version }}</span>
            <div>
              <div class="font-bold">v{{ v.version }}</div>
              <div class="text-xs text-zinc-500">Published {{ getDaysAgo({ createdAt: v.published_at }) }} days ago</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button @click="$emit('select-version', v.version)"
              class="text-zinc-500 hover:text-white text-xs font-bold">View →</button>
            <button @click="$emit('download', '/v1/packages/' + encodeURIComponent(repo.name) + '/' + v.version + '/tarball')"
              class="text-orange-500 hover:text-orange-400 text-sm font-bold">Download →</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
