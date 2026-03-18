<script setup>
defineProps({
    visible: Boolean,
    url: String
});

defineEmits(['close']);
</script>

<template>
    <div v-if="visible" class="fixed inset-0 z-[130] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/90 backdrop-blur-md" @click="$emit('close')"></div>
        <div class="bg-card border border-amber-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative z-[140]">
            <div class="p-6 border-b border-amber-500/20 bg-amber-500/10 flex justify-between items-center">
                <h3 class="text-xl font-bold tracking-tight flex items-center gap-2">
                    <span class="text-2xl">⚠️</span>
                    <span class="text-amber-500">IMPORTANT SAFETY NOTICE</span>
                </h3>
                <button @click="$emit('close')" aria-label="Close" class="text-zinc-500 hover:text-white transition-colors text-2xl">&times;</button>
            </div>
            <div class="p-6 space-y-4">
                <p class="text-zinc-300 font-medium">Before downloading this skill:</p>
                <ul class="space-y-2 text-sm text-zinc-400">
                    <li class="flex items-start gap-2">
                        <span class="text-amber-500 mt-0.5">•</span>
                        <span>This skill has been cryptographically verified, but verification ≠ safety</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span class="text-amber-500 mt-0.5">•</span>
                        <span>Review the declared permissions in manifest.json</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span class="text-amber-500 mt-0.5">•</span>
                        <span>Never extract and run skills without human oversight</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span class="text-amber-500 mt-0.5">•</span>
                        <span>Extraction could overwrite critical files</span>
                    </li>
                </ul>
                <div class="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <p class="text-sm text-zinc-500 italic text-center">"Trust verification, but verify what you trust."</p>
                </div>
            </div>
            <div class="p-6 border-t border-zinc-800 flex gap-3 justify-end bg-black/20">
                <button @click="$emit('close')" class="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold transition-colors">Cancel</button>
                <a :href="url" @click="$emit('close')" class="px-6 py-2 lobster-gradient text-black rounded-lg text-sm font-bold transition-transform active:scale-95">I Understand - Download</a>
            </div>
        </div>
    </div>
</template>
