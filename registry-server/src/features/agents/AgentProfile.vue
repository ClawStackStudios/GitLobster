<script setup>
import { computed } from 'vue';
import { useAgentProfile } from './composables/useAgentProfile';

// Child components
import AgentIdentityCard from './components/AgentIdentityCard.vue';
import CapabilitiesTab from './components/CapabilitiesTab.vue';
import AboutTab from './components/AboutTab.vue';
import ActivityTab from './components/ActivityTab.vue';

// ========== Props & Emits ==========
const props = defineProps({
  agent: { type: Object, required: true }
});

const emit = defineEmits(['back', 'view-package', 'view-activity']);

// ========== Composable ==========
const agentPropRef = computed(() => props.agent);

const {
  fullAgent, loading, activeTab, showFullKey,
  activityTimeline, activityLoading,
  keyFingerprint, verificationBadge,
  copyToClipboard, formatTimeAgo,
  getAuthorFingerprint, getActivityIcon, getActivityColor,
} = useAgentProfile(agentPropRef, emit);
</script>

<template>
  <div class="space-y-12">
    <!-- Back Button -->
    <button @click="emit('back')"
      class="text-zinc-500 hover:text-white flex items-center gap-2 text-sm transition-colors">
      ← Back to The Mesh
    </button>

    <!-- Loading State -->
    <div v-if="loading && !fullAgent" class="text-center py-20">
      <p class="animate-pulse text-zinc-500">Decrypting identity...</p>
    </div>

    <!-- Main Layout -->
    <div v-else-if="fullAgent" class="flex flex-col md:flex-row gap-12 items-start">

      <!-- Left Sidebar -->
      <AgentIdentityCard
        :agent="fullAgent"
        :key-fingerprint="keyFingerprint"
        :verification-badge="verificationBadge"
        :show-full-key="showFullKey"
        @update:show-full-key="showFullKey = $event"
        @copy="copyToClipboard" />

      <!-- Main Content -->
      <div class="flex-1 space-y-8">
        <!-- Tab Navigation -->
        <div class="flex gap-1 bg-zinc-900/50 p-1 rounded-xl">
          <button v-for="tab in ['capabilities', 'about', 'activity']" :key="tab"
            @click="activeTab = tab"
            class="flex-1 py-3 px-4 rounded-lg text-sm font-bold uppercase tracking-wider transition-all"
            :class="activeTab === tab
              ? 'bg-zinc-800 text-orange-400 shadow-lg'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'">
            {{ tab === 'capabilities' ? 'Capabilities' : tab }}
          </button>
        </div>

        <!-- Tab: Capabilities -->
        <CapabilitiesTab v-if="activeTab === 'capabilities'"
          :skills="fullAgent.skills"
          :get-author-fingerprint="getAuthorFingerprint"
          :copy-to-clipboard="copyToClipboard"
          @view-package="emit('view-package', $event)" />

        <!-- Tab: About -->
        <AboutTab v-if="activeTab === 'about'"
          :agent="fullAgent" />

        <!-- Tab: Activity -->
        <ActivityTab v-if="activeTab === 'activity'"
          :timeline="activityTimeline"
          :loading="activityLoading"
          :agent-name="fullAgent.name"
          :get-activity-icon="getActivityIcon"
          :get-activity-color="getActivityColor"
          :format-time-ago="formatTimeAgo"
          @view-activity="emit('view-activity', $event)" />
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-20">
      <p class="text-red-500 mono">ERROR: AGENT_DATA_CORRUPTED</p>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
button { transition: all 0.2s ease; }
.group\/card:hover h4 { text-shadow: 0 0 20px rgba(249, 115, 22, 0.3); }
</style>
