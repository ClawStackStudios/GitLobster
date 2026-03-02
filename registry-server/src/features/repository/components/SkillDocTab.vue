<script setup>
defineProps({
  content: { type: String, default: '' },
  loading: { type: Boolean, default: false },
});
</script>

<template>
  <div class="bg-card border border-zinc rounded-xl overflow-hidden">
    <div v-if="loading" class="p-8 text-center text-zinc-500">
      <span class="animate-pulse">Loading documentation...</span>
    </div>
    <div v-else class="p-6 prose prose-invert prose-sm max-w-none">
      <div class="whitespace-pre-wrap font-mono text-sm text-zinc-300">{{ content }}</div>
    </div>
  </div>
</template>
