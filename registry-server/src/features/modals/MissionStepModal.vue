<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
    visible: Boolean,
    mission: Object
});

const emit = defineEmits(['close']);

const currentStep = ref(0);
const completedSteps = ref({});
const copySuccess = ref(false);

// Reset state when mission opens
watch(() => props.visible, (newVal) => {
    if (newVal) {
        currentStep.value = 0;
        copySuccess.value = false;
        // Reload completed steps from storage
        const stored = localStorage.getItem('completedSteps');
        if (stored) {
            completedSteps.value = JSON.parse(stored);
        }
    }
});

const nextStep = () => {
    if (props.mission && currentStep.value < props.mission.steps.length - 1) {
        currentStep.value++;
    }
};

const prevStep = () => {
    if (currentStep.value > 0) {
        currentStep.value--;
    }
};

const toggleStepComplete = (stepIndex) => {
    if (!props.mission) return;
    const missionId = props.mission.id;
    
    if (!completedSteps.value[missionId]) {
        completedSteps.value[missionId] = [];
    }

    const idx = completedSteps.value[missionId].indexOf(stepIndex);
    if (idx > -1) {
        completedSteps.value[missionId].splice(idx, 1);
    } else {
        completedSteps.value[missionId].push(stepIndex);
    }

    // Save to localStorage
    localStorage.setItem('completedSteps', JSON.stringify(completedSteps.value));
};

const isStepCompleted = (missionId, stepIndex) => {
    return completedSteps.value[missionId]?.includes(stepIndex) || false;
};

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        copySuccess.value = true;
        setTimeout(() => { copySuccess.value = false; }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
};

const copyAllSteps = () => {
    if (!props.mission) return;

    let allText = `Mission: ${props.mission.title}\n\n`;
    props.mission.steps.forEach((step, idx) => {
        allText += `Step ${idx + 1}: ${step.title}\n`;
        allText += `${step.description}\n\n`;
        if (step.code) {
            allText += `${step.code}\n\n`;
        }
        if (step.note) {
            allText += `Note: ${step.note}\n\n`;
        }
        allText += '---\n\n';
    });

    copyToClipboard(allText);
};
</script>

<template>
    <div v-if="visible && mission" class="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/90 backdrop-blur-md" @click="$emit('close')"></div>
        <div class="bg-card border border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl relative z-[130]">
            <!-- Header -->
            <div class="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
                <div>
                    <h3 class="text-xl font-bold tracking-tight mb-1">{{ mission.title }}</h3>
                    <p class="text-xs text-zinc-500">Step {{ currentStep + 1 }} of {{ mission.steps.length }}</p>
                </div>
                <button @click="$emit('close')" aria-label="Close" class="text-zinc-500 hover:text-white transition-colors text-2xl">&times;</button>
            </div>

            <!-- Progress Bar -->
            <div class="w-full h-1 bg-zinc-900">
                <div class="h-full lobster-gradient transition-all duration-300"
                    :style="{ width: ((currentStep + 1) / mission.steps.length * 100) + '%' }"></div>
            </div>

            <!-- Step Content -->
            <div class="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-220px)]">
                <div v-if="mission.steps[currentStep]">
                    <!-- Step Header -->
                    <div class="flex items-start gap-4 mb-6">
                        <button @click="toggleStepComplete(currentStep)" aria-label="Toggle step completion"
                            class="flex-shrink-0 w-8 h-8 rounded-full border-2 transition-all" :class="isStepCompleted(mission.id, currentStep)
                                ? 'border-green-500 bg-green-500/20 text-green-400'
                                : 'border-zinc-700 hover:border-zinc-500'">
                            <span v-if="isStepCompleted(mission.id, currentStep)" class="text-lg">✓</span>
                            <span v-else class="text-zinc-600">○</span>
                        </button>
                        <div class="flex-1">
                            <h4 class="text-lg font-bold mb-2">{{ mission.steps[currentStep].title }}</h4>
                            <p class="text-sm text-zinc-400 leading-relaxed">{{
                                mission.steps[currentStep].description }}</p>
                        </div>
                    </div>

                    <!-- Code Block -->
                    <div v-if="mission.steps[currentStep].code" class="relative group">
                        <pre
                            class="p-6 bg-black/40 rounded-2xl text-xs mono text-emerald-400 whitespace-pre-wrap border border-zinc-800/50 leading-relaxed overflow-x-auto">{{ mission.steps[currentStep].code }}</pre>
                        <button @click="copyToClipboard(mission.steps[currentStep].code)"
                            class="absolute top-4 right-4 bg-zinc-800 hover:bg-zinc-700 hover:scale-110 p-2 rounded-lg text-[10px] font-bold transition-all border border-white/5">
                            {{ copySuccess ? '✅ COPIED' : '📋 COPY' }}
                        </button>
                    </div>

                    <!-- Note -->
                    <div v-if="mission.steps[currentStep].note"
                        class="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                        <p class="text-xs text-orange-400/80 leading-relaxed">
                            <span class="font-bold">💡 Note:</span> {{ mission.steps[currentStep].note }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Footer Navigation -->
            <div class="p-6 border-t border-zinc-800 flex justify-between items-center bg-black/20">
                <div class="flex gap-3">
                    <button @click="prevStep" :disabled="currentStep === 0"
                        class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                        ← Previous
                    </button>
                    <button @click="nextStep" :disabled="currentStep === mission.steps.length - 1"
                        class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                        Next →
                    </button>
                </div>
                <div class="flex gap-3">
                    <button @click="copyAllSteps"
                        class="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-xs font-bold transition-colors border border-zinc-700">
                        📋 Copy All Steps
                    </button>
                    <button @click="$emit('close')"
                        class="px-6 py-2 lobster-gradient text-black rounded-lg text-xs font-bold transition-colors">
                        Done
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
