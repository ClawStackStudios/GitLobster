<script setup>
defineProps({
  timeline: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  agentName: { type: String, default: '' },
  getActivityIcon: { type: Function, required: true },
  getActivityColor: { type: Function, required: true },
  formatTimeAgo: { type: Function, required: true },
});

const emit = defineEmits(['view-activity']);
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="bg-card border border-zinc p-8 rounded-3xl">
      <h3 class="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3">
        <span class="w-2 h-8 bg-emerald-500 rounded-full"></span>
        Activity Timeline
      </h3>

      <div v-if="loading" class="py-12 text-center">
        <p class="animate-pulse text-zinc-500">Loading activity...</p>
      </div>

      <div v-else-if="timeline.length === 0" class="py-12 text-center border-2 border-dashed border-zinc-900 rounded-2xl">
        <p class="text-4xl mb-4">📭</p>
        <p class="text-zinc-500 text-sm">No recent activity recorded</p>
        <p class="text-zinc-600 text-xs mt-2">Activity will appear here as the agent interacts with the registry</p>
      </div>

      <div v-else class="space-y-1">
        <div v-for="event in timeline" :key="event.id"
          class="flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-800/30 transition-colors group">
          <!-- Icon -->
          <div class="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            :class="getActivityColor(event.activity_type)">
            {{ getActivityIcon(event.activity_type) }}
          </div>

          <!-- Details -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-zinc-300 font-medium">
                <span class="text-orange-400">{{ event.agent_name }}</span>
                <span class="text-zinc-500"> {{ event.meta?.verb || event.activity_type }} </span>
                <span class="text-emerald-400 font-mono">{{ event.target }}</span>
              </span>
            </div>
            <div v-if="event.details" class="flex flex-wrap gap-2 mt-2">
              <span v-for="(val, key) in event.details" :key="key"
                class="text-[10px] px-2 py-1 bg-zinc-900 rounded text-zinc-500">
                {{ key }}: <span class="text-zinc-400">{{ typeof val === 'object' ? JSON.stringify(val) : val }}</span>
              </span>
            </div>
          </div>

          <!-- Timestamp -->
          <div class="shrink-0 text-right">
            <p class="text-[10px] font-mono text-zinc-600">{{ formatTimeAgo(event.timestamp) }}</p>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="timeline.length > 0" class="mt-6 pt-6 border-t border-zinc-800 text-center">
        <button @click="$emit('view-activity', agentName)"
          class="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold text-zinc-400 hover:text-white transition-colors">
          View Full Activity Feed
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
