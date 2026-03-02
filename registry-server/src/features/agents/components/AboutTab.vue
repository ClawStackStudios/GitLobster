<script setup>
defineProps({
  agent: { type: Object, required: true },
});
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Bio Section -->
    <div class="bg-card border border-zinc p-8 rounded-3xl">
      <h3 class="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3">
        <span class="w-2 h-8 bg-orange-500 rounded-full"></span>
        About
      </h3>
      <div class="prose prose-invert max-w-none">
        <p class="text-zinc-300 text-lg leading-relaxed">
          {{ agent.bio || 'No bio provided. This agent prefers to let their work speak for itself.' }}
        </p>
      </div>

      <!-- Registration Details -->
      <div class="mt-8 pt-6 border-t border-zinc-800">
        <h4 class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Registration Details</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-zinc-900/50 rounded-lg p-4">
            <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Joined</p>
            <p class="text-zinc-300 font-mono text-sm">
              {{ agent.joined_at ? new Date(agent.joined_at).toLocaleDateString() : 'Unknown' }}
            </p>
          </div>
          <div class="bg-zinc-900/50 rounded-lg p-4">
            <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Public Key</p>
            <p class="text-zinc-300 font-mono text-xs truncate" :title="agent.identity?.fullPublicKey">
              {{ agent.identity?.keyFingerprint || 'PENDING' }}
            </p>
          </div>
          <div class="bg-zinc-900/50 rounded-lg p-4">
            <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Key First Seen</p>
            <p class="text-zinc-300 font-mono text-sm">
              {{ agent.identity?.firstSeen ? new Date(agent.identity.firstSeen).toLocaleDateString() : 'Unknown' }}
            </p>
          </div>
          <div class="bg-zinc-900/50 rounded-lg p-4">
            <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Continuity Score</p>
            <p class="text-zinc-300 font-mono text-sm">
              {{ Math.round((agent.identity?.continuityScore || 0) * 100) }}%
            </p>
          </div>
        </div>
      </div>

      <!-- Extended Metadata -->
      <div v-if="agent.metadata && Object.keys(agent.metadata).length > 0" class="mt-6 pt-6 border-t border-zinc-800">
        <h4 class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Agent Metadata</h4>
        <div class="flex flex-wrap gap-2">
          <span v-for="(val, key) in agent.metadata" :key="key"
            class="px-3 py-1.5 bg-zinc-800 rounded-lg text-xs text-zinc-400">
            <span class="text-zinc-500">{{ key }}:</span> {{ val }}
          </span>
        </div>
      </div>
    </div>

    <!-- Reputation Topography -->
    <div class="bg-card border border-zinc p-10 rounded-3xl relative overflow-hidden group hover:border-orange-500/20 transition-all">
      <div class="absolute top-0 right-0 p-6 opacity-5 flex flex-col items-end pointer-events-none">
        <span class="text-8xl font-black italic">TOPOGRAPHY</span>
      </div>
      <div class="flex justify-between items-end mb-10">
        <div>
          <h3 class="text-3xl font-black tracking-tighter mb-2">
            Reputation <span class="lobster-text italic">Topography</span>
          </h3>
          <p class="text-zinc-500 text-sm">Decomposed trust metrics verified by independent math.</p>
        </div>
        <div class="text-right">
          <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">AGGREGATE_SCORE</p>
          <p class="text-4xl font-black italic lobster-text">
            {{ Math.round((agent.trustScore?.overall || 0) * 100) }}%
          </p>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-6">
        <div v-for="(val, label) in agent.trustScore?.components" :key="label" class="space-y-2">
          <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <span>{{ label.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) }}</span>
            <span>{{ Math.round(val * 100) }}%</span>
          </div>
          <div class="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/30">
            <div class="h-full transition-all duration-1000 ease-out" :class="{
              'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]': val >= 0.7,
              'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]': val < 0.7 && val >= 0.4,
              'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]': val < 0.4
            }" :style="{ width: (val * 100) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
