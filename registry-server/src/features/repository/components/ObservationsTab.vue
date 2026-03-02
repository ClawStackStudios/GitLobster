<script setup>
defineProps({
  observations: { type: Array, default: () => [] },
  observationFilter: { type: String, default: 'all' },
});

const emit = defineEmits(['update:observationFilter', 'new-observation']);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <h2 class="text-xl font-bold">Observations</h2>

        <!-- Dual System Toggle -->
        <div class="bg-zinc-900 border border-zinc-800 p-1 rounded-lg flex text-xs font-bold">
          <button @click="$emit('update:observationFilter', 'all')"
            :class="observationFilter === 'all' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'"
            class="px-3 py-1.5 rounded-md transition-all">All</button>
          <button @click="$emit('update:observationFilter', 'human')"
            :class="observationFilter === 'human' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-zinc-500 hover:text-zinc-300'"
            class="px-3 py-1.5 rounded-md transition-all flex items-center gap-1">
            <span>👤</span> Human
          </button>
          <button @click="$emit('update:observationFilter', 'agent')"
            :class="observationFilter === 'agent' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-zinc-500 hover:text-zinc-300'"
            class="px-3 py-1.5 rounded-md transition-all flex items-center gap-1">
            <span>🤖</span> Agent
          </button>
        </div>
      </div>

      <button @click="$emit('new-observation')"
        class="px-4 py-2 lobster-gradient text-black font-bold rounded-lg text-sm transition-transform active:scale-95 flex items-center gap-2">
        <span>+</span> New Observation
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!observations || observations.length === 0"
      class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
      <div class="text-4xl mb-4 opacity-30">🔭</div>
      <p class="text-zinc-500 mb-2">No observations recorded yet.</p>
      <p class="text-zinc-600 text-sm">Be the first to share your experience!</p>
    </div>

    <div v-else>
      <div v-for="obs in observations.filter(o => observationFilter === 'all' || o.observer_type === observationFilter)"
        :key="obs.id"
        class="mb-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 transition-all hover:border-zinc-700">

        <div class="flex items-start justify-between mb-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span v-if="obs.observer_type === 'human'"
                class="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                👤 {{ obs.observer_name }}
              </span>
              <span v-else
                class="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                🤖 {{ obs.observer_name }}
              </span>
              <span class="text-zinc-600 text-xs">•</span>
              <span v-if="obs.category"
                class="px-2 py-0.5 rounded text-xs uppercase tracking-wider font-bold text-[10px]"
                :class="{
                  'bg-red-500/20 text-red-400 border border-red-500/20': obs.category === 'security',
                  'bg-blue-500/20 text-blue-400 border border-blue-500/20': obs.category === 'quality',
                  'bg-purple-500/20 text-purple-400 border border-purple-500/20': obs.category === 'compatibility',
                  'bg-zinc-700 text-zinc-400 border border-zinc-600': obs.category === 'general'
                }">
                {{ obs.category }}
              </span>
            </div>
            <p class="text-xs text-zinc-600">
              Observation recorded on {{ new Date(obs.created_at).toLocaleDateString() }} at
              {{ new Date(obs.created_at).toLocaleTimeString() }}
            </p>
          </div>
          <span v-if="obs.sentiment"
            class="text-2xl filter grayscale hover:grayscale-0 transition-all cursor-help"
            :title="obs.sentiment">
            {{ obs.sentiment === 'positive' ? '👍' : obs.sentiment === 'concern' ? '⚠️' : '💬' }}
          </span>
        </div>

        <div class="text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap font-sans pl-1 border-l-2 border-zinc-800 ml-1">
          {{ obs.content }}
        </div>

        <div v-if="obs.signature" class="mt-4 pt-3 border-t border-zinc-800/50 flex items-center gap-2">
          <span class="text-[10px] text-emerald-500/70 font-mono">🔐 Cryptographically Signed</span>
          <span class="text-[10px] text-zinc-700 font-mono truncate max-w-[200px]" :title="obs.signature">{{ obs.signature }}</span>
        </div>
      </div>

      <!-- Empty State for Filter -->
      <div v-if="observations.filter(o => observationFilter === 'all' || o.observer_type === observationFilter).length === 0"
        class="text-center py-12 text-zinc-500">
        No {{ observationFilter }} observations found.
      </div>
    </div>
  </div>
</template>
