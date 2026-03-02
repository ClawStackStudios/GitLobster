<script setup>
const props = defineProps({
  skills: { type: Array, default: () => [] },
  getAuthorFingerprint: { type: Function, required: true },
  copyToClipboard: { type: Function, required: true },
});

const emit = defineEmits(['view-package']);
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-8">
      <h3 class="text-2xl font-bold tracking-tight border-b border-zinc-900 pb-4">Published Capabilities</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="pkg in skills" :key="pkg.name"
          class="bg-card border border-zinc p-6 rounded-2xl hover:border-orange-500/30 transition-all flex flex-col group/card">
          <div class="flex justify-between items-start mb-4">
            <h4 class="text-lg font-bold group-hover/card:text-orange-400 transition-colors">{{ pkg.name }}</h4>
            <div class="px-2 py-0.5 bg-zinc-900 rounded text-[9px] font-black text-zinc-500 uppercase tracking-tighter">
              v{{ pkg.latest_version || '0.0.0' }}
            </div>
          </div>
          <p class="text-zinc-500 text-xs mb-4 flex-1 italic leading-relaxed">{{ pkg.description }}</p>

          <!-- Author Fingerprint -->
          <div v-if="getAuthorFingerprint(pkg)" class="mb-4 px-3 py-2 bg-zinc-900/50 rounded-lg flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Author Key</span>
              <span class="text-[10px] font-mono text-orange-400/80">{{ getAuthorFingerprint(pkg) }}</span>
            </div>
            <button @click="copyToClipboard(pkg.author_public_key)"
              class="text-zinc-600 hover:text-zinc-400 transition-colors" title="Copy full public key">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                </path>
              </svg>
            </button>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-4 mb-4 text-[10px] text-zinc-500">
            <span v-if="pkg.downloads" class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              {{ pkg.downloads }}
            </span>
            <span v-if="pkg.stars" class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              {{ pkg.stars }}
            </span>
          </div>

          <div class="pt-4 border-t border-zinc-800 flex justify-between items-center">
            <div class="flex gap-2">
              <span v-for="tag in (pkg.tags || []).slice(0, 3)" :key="tag"
                class="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">{{ tag }}</span>
            </div>
            <button @click="$emit('view-package', pkg)"
              class="text-orange-500/50 hover:text-orange-500 text-[10px] font-black uppercase tracking-widest transition-colors">
              Inspect_Skill →
            </button>
          </div>
        </div>
      </div>

      <div v-if="!skills || skills.length === 0"
        class="text-center py-12 border-2 border-dashed border-zinc-900 rounded-3xl text-zinc-600 text-sm mono">
        NO_CAPABILITIES_REGISTERED_TO_THIS_IDENTITY
      </div>
    </div>
  </div>
</template>
