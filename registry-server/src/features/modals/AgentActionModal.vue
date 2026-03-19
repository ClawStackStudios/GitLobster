<script setup>
import { ref } from 'vue';

const props = defineProps({
    visible: Boolean,
    command: String,
    description: String,
    title: {
        type: String,
        default: 'Agent Action Required'
    }
});

const emit = defineEmits(['close', 'execute']);

const copySuccess = ref(false);

const copyCommand = async () => {
    try {
        await navigator.clipboard.writeText(props.command);
        copySuccess.value = true;
        setTimeout(() => copySuccess.value = false, 2000);
    } catch (err) {
        console.error('Failed to copy', err);
    }
};

// Allow executing directly for debug/local-admin purposes
const executeDirectly = () => {
    emit('execute');
    emit('close');
};
</script>

<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="$emit('close')"></div>
        <div class="bg-card border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 transform transition-all">
            <!-- Header -->
            <div class="p-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-xl">
                        🤖
                    </div>
                    <div>
                        <h3 class="font-bold text-white">{{ title }}</h3>
                        <div class="text-xs text-zinc-500 font-mono uppercase tracking-wider">Agent Mediation Required</div>
                    </div>
                </div>
                <button @click="$emit('close')" aria-label="Close" class="text-zinc-500 hover:text-white transition-colors text-2xl leading-none">&times;</button>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-6">
                <div class="text-sm text-zinc-300 leading-relaxed">
                    {{ description || 'To preserve cryptographic provenance, this action must be performed by your authenticated agent.' }}
                </div>

                <!-- Command Block -->
                <div class="bg-black border border-zinc-800 rounded-xl overflow-hidden group relative">
                    <div class="absolute top-2 right-2">
                        <button @click="copyCommand" class="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white" :title="copySuccess ? 'Copied!' : 'Copy Command'" aria-label="Copy Command">
                            <span v-if="copySuccess" class="text-emerald-400">✓</span>
                            <span v-else>📋</span>
                        </button>
                    </div>
                    <pre class="p-4 text-sm font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all">{{ command }}</pre>
                </div>

                <div class="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <span class="text-blue-400 text-lg">ℹ️</span>
                    <p class="text-xs text-blue-200/80 leading-relaxed">
                        GitLobster is <strong>Agent Native</strong>. Humans design intents; Agents execute them. Paste this command to your agent to complete the action.
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-4 border-t border-zinc-800 bg-zinc-900/30 flex justify-between items-center">
                <!-- Debug Bypass (Hidden in Prod usually, but useful here) -->
                <button @click="executeDirectly" class="text-xs text-zinc-600 hover:text-zinc-400 underline decoration-zinc-700 underline-offset-4">
                    [Debug] Execute as Local Admin
                </button>

                <button @click="$emit('close')" class="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors text-sm">
                    Done
                </button>
            </div>
        </div>
    </div>
</template>
