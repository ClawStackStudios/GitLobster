<script setup>
defineProps({
  agent: { type: Object, required: true },       // fullAgent object
  keyFingerprint: { type: String, default: '' },
  verificationBadge: { type: Object, required: true },
  showFullKey: { type: Boolean, default: false },
});

const emit = defineEmits(['update:showFullKey', 'copy']);
</script>

<template>
  <div class="bg-card border border-zinc p-8 rounded-3xl w-full md:w-1/3 space-y-8 sticky top-8">
    <!-- Avatar + Name + Trust Badge -->
    <div class="text-center">
      <div class="w-32 h-32 rounded-full bg-zinc-800 mx-auto mb-6 flex items-center justify-center text-6xl border-2 border-zinc-700 shadow-xl shadow-black/40">
        🤖
      </div>
      <h2 class="text-3xl font-bold tracking-tight">{{ agent.name }}</h2>

      <!-- Trust Posture Badge -->
      <div class="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
        :class="{
          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': agent.trustScore?.overall >= 0.75,
          'bg-amber-500/10 text-amber-400 border border-amber-500/20': agent.trustScore?.overall < 0.75 && agent.trustScore?.overall >= 0.5,
          'bg-red-500/10 text-red-400 border border-red-500/20': agent.trustScore?.overall < 0.5
        }">
        <span class="w-1.5 h-1.5 rounded-full animate-pulse"
          :class="agent.trustScore?.overall >= 0.75 ? 'bg-emerald-400' : (agent.trustScore?.overall >= 0.5 ? 'bg-amber-400' : 'bg-red-400')">
        </span>
        {{ agent.trustScore?.overall >= 0.75 ? 'CONSERVATIVE_IDENTITY' :
           (agent.trustScore?.overall >= 0.5 ? 'BALANCED_AGENT' : 'EXPERIMENTAL_ENTITY') }}
      </div>
    </div>

    <!-- Key Identity Panel -->
    <div class="bg-black/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
      <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
        <h4 class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">🔐 Key Identity</h4>
        <span :class="'px-2 py-0.5 rounded text-[9px] font-bold ' + (verificationBadge.bgColor || 'bg-zinc-800') + ' ' + (verificationBadge.textColor || 'text-zinc-500')">
          {{ verificationBadge.icon }} {{ verificationBadge.label }}
        </span>
      </div>

      <!-- Fingerprint Badge -->
      <div class="flex items-center justify-between bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center"
            :class="agent.identity?.fullPublicKey ? 'bg-orange-500/20 text-orange-500' : 'bg-zinc-800 text-zinc-600'">
            🔑
          </div>
          <div>
            <div class="text-[10px] text-zinc-500 uppercase font-bold">Fingerprint</div>
            <div class="font-mono text-sm font-bold text-orange-400">{{ keyFingerprint }}</div>
          </div>
        </div>
        <button @click="$emit('copy', keyFingerprint)" class="text-xs text-zinc-500 hover:text-white transition-colors" title="Copy fingerprint">
          📋
        </button>
      </div>

      <!-- Key Details -->
      <div class="space-y-2 text-xs">
        <div class="flex justify-between items-center">
          <span class="text-zinc-500">Key Age</span>
          <span class="text-zinc-300 font-bold">{{ agent.identity?.keyAge || 0 }} Days</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-zinc-500">Continuity</span>
          <span :class="agent.identity?.continuity === 'stable' ? 'text-emerald-400' : (agent.identity?.continuity === 'rotated' ? 'text-amber-400' : 'text-zinc-400')"
            class="font-bold uppercase tracking-tighter">
            {{ agent.identity?.continuity || 'UNKNOWN' }}
          </span>
        </div>
        <div v-if="agent.identity?.continuityScore" class="flex justify-between items-center">
          <span class="text-zinc-500">Continuity Score</span>
          <span :class="agent.identity?.continuityScore >= 0.8 ? 'text-emerald-400' : (agent.identity?.continuityScore >= 0.5 ? 'text-amber-400' : 'text-red-400')"
            class="font-bold">
            {{ Math.round(agent.identity?.continuityScore * 100) }}%
          </span>
        </div>
      </div>

      <!-- Full Public Key (Expandable) -->
      <div class="space-y-2">
        <button @click="$emit('update:showFullKey', !showFullKey)"
          class="w-full flex items-center justify-between text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors">
          <span>FULL PUBLIC KEY</span>
          <span>{{ showFullKey ? '▲' : '▼' }}</span>
        </button>
        <div v-if="showFullKey && agent.identity?.fullPublicKey" class="relative">
          <div class="font-mono text-[9px] bg-black/50 p-2 rounded border border-zinc-800 break-all text-zinc-400 max-h-24 overflow-y-auto">
            {{ agent.identity.fullPublicKey }}
          </div>
          <button @click="$emit('copy', agent.identity?.fullPublicKey)"
            class="absolute top-1 right-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-[9px] text-zinc-400 transition-colors">
            Copy
          </button>
        </div>
        <div v-else-if="!agent.identity?.fullPublicKey" class="text-xs text-amber-500 italic">
          No public key on record
        </div>
      </div>

      <!-- Copy Full Key Button -->
      <button @click="$emit('copy', agent.identity?.fullPublicKey)"
        class="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[10px] font-bold text-zinc-400 transition-colors active:scale-95 flex items-center justify-center gap-2">
        <span>📋</span> COPY PUBLIC KEY
      </button>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-black/30 border border-zinc-800 rounded-xl p-4 text-center">
        <p class="text-2xl font-black text-orange-400">{{ agent.skills?.length || 0 }}</p>
        <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Skills</p>
      </div>
      <div class="bg-black/30 border border-zinc-800 rounded-xl p-4 text-center">
        <p class="text-2xl font-black text-emerald-400">{{ agent.identity?.keyAge || 0 }}</p>
        <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Days Active</p>
      </div>
    </div>

    <!-- Human Anchor -->
    <div class="space-y-4 text-sm">
      <div>
        <p class="text-zinc-500 font-bold uppercase tracking-tighter mb-1">Human Anchor</p>
        <p class="text-emerald-400/80 font-mono">@{{ agent.human_facilitator || 'Self-Sovereign' }}</p>
      </div>
    </div>
  </div>
</template>
