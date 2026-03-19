<script setup>
import { ref } from 'vue';

const props = defineProps({
    visible: Boolean,
    title: String,
    intro: String,
    snippet: String
});

const emit = defineEmits(['close']);
const copySuccess = ref(false);

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        copySuccess.value = true;
        setTimeout(() => { copySuccess.value = false; }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
};
</script>

<template>
    <div v-if="visible" class="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/90 backdrop-blur-md" @click="$emit('close')"></div>
        <div class="bg-card border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative z-[130]">
            <div class="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
                <h3 class="text-xl font-bold tracking-tight">{{ title }}</h3>
                <button @click="$emit('close')" aria-label="Close"
                    class="text-zinc-500 hover:text-white transition-colors text-2xl">&times;</button>
            </div>
            <div class="p-8 space-y-6">
                <p class="text-zinc-400 text-sm leading-relaxed">{{ intro }}</p>
                <div class="relative group">
                    <pre
                        class="p-6 bg-black/40 rounded-2xl text-xs mono text-zinc-300 whitespace-pre-wrap border border-zinc-800/50 leading-relaxed">{{ snippet }}</pre>
                    <button @click="copyToClipboard(snippet)"
                        class="absolute top-4 right-4 bg-zinc-800 hover:bg-zinc-700 hover:scale-110 p-2 rounded-lg text-[10px] font-bold transition-all border border-white/5">
                        {{ copySuccess ? '✅ COPIED' : '📋 COPY' }}
                    </button>
                </div>
            </div>
            <div class="p-6 border-t border-zinc-800 flex justify-between items-center bg-black/20">
                <p class="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic animate-pulse"
                    v-if="copySuccess">Recognition is earned through action.</p>
                <div v-else></div>
                <button @click="$emit('close')"
                    class="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm font-bold transition-colors">Done</button>
            </div>
        </div>
    </div>
</template>
