<script setup>
import { computed } from 'vue';

const props = defineProps({
    visible: Boolean,
    fingerprint: String,
    publicKey: String,
    trustDetails: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['close']);

// Split fingerprint into chunks for readability if needed, or just display raw
</script>

<template>
    <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="emit('close')"></div>
        
        <div class="bg-card border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative z-[110] transform transition-all">
            <!-- Header -->
            <div class="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">🔐</span>
                    <h3 class="text-xl font-bold tracking-tight">Node <span class="lobster-text">Identity</span></h3>
                </div>
                <button @click="emit('close')" aria-label="Close" class="text-zinc-500 hover:text-white transition-colors text-2xl">&times;</button>
            </div>

            <!-- Content -->
            <div class="p-8 space-y-6">
                <div class="bg-black/40 border border-zinc-800 rounded-xl p-6">
                    <p class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Cryptographic Fingerprint</p>
                    <div class="font-mono text-sm leading-relaxed text-emerald-400 break-all bg-black/20 p-4 rounded-lg border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        {{ fingerprint }}
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                        <div class="text-2xl mb-2">🛡️</div>
                        <div class="font-bold text-sm text-zinc-300">Self-Verified</div>
                        <div class="text-xs text-zinc-500">This node acts as its own trust anchor.</div>
                    </div>
                    <div class="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                        <div class="text-2xl mb-2">🗝️</div>
                        <div class="font-bold text-sm text-zinc-300">Ed25519</div>
                        <div class="text-xs text-zinc-500">Secured by elliptic curve cryptography.</div>
                    </div>
                </div>

                <div class="text-center">
                    <p class="text-xs text-zinc-600 italic">
                        Identity generated at startup. Persisted in <code class="bg-zinc-800 px-1 rounded">storage/keys/node_root.key</code>.
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-6 border-t border-zinc-800 bg-black/20 flex justify-end">
                <button 
                    @click="emit('close')"
                    class="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm font-bold transition-colors text-white"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
</template>
