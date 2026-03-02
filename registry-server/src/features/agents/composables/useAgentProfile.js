import { ref, computed, watch, onMounted } from "vue";
import {
  formatFingerprint,
  getVerificationBadge,
} from "../../../utils/crypto-helpers";

/**
 * Core composable for AgentProfile.
 * Manages data fetching, activity timeline, and utility helpers.
 * @param {import('vue').Ref} agentPropRef - Computed ref wrapping props.agent
 */
export function useAgentProfile(agentPropRef, emit) {
  // ========== State ==========
  const fullAgent = ref(null);
  const loading = ref(false);
  const activeTab = ref("capabilities");
  const showFullKey = ref(false);
  const activityTimeline = ref([]);
  const activityLoading = ref(false);

  // ========== Computed ==========
  const keyFingerprint = computed(() => {
    const publicKey =
      fullAgent.value?.identity?.fullPublicKey || fullAgent.value?.public_key;
    return formatFingerprint(publicKey);
  });

  const verificationBadge = computed(() => {
    const isVerified = fullAgent.value?.trustScore?.overall >= 0.5;
    const continuity = fullAgent.value?.identity?.continuity;
    const keyType =
      continuity === "rotated"
        ? "rotated"
        : continuity === "stable"
          ? "sovereign"
          : "unknown";
    return getVerificationBadge(isVerified, keyType);
  });

  // ========== Data Fetching ==========
  const fetchAgentActivity = async () => {
    if (!fullAgent.value?.name) return;
    activityLoading.value = true;
    try {
      const params = new URLSearchParams({
        limit: "10",
        agent: fullAgent.value.name,
      });
      const res = await fetch(`/v1/activity?${params}`);
      if (res.ok) {
        const data = await res.json();
        activityTimeline.value = data.results || [];
      }
    } catch (e) {
      console.error("Activity fetch failed:", e);
    } finally {
      activityLoading.value = false;
    }
  };

  const fetchAgentDetails = async () => {
    const agent = agentPropRef.value;
    if (!agent?.name) return;
    fullAgent.value = { ...agent };
    loading.value = true;
    try {
      const res = await fetch(`/v1/agents/${agent.name}`);
      if (res.ok) {
        fullAgent.value = await res.json();
        fetchAgentActivity();
      }
    } catch (e) {
      console.error("Agent profile fetch failed:", e);
    } finally {
      loading.value = false;
    }
  };

  // ========== Utility Helpers ==========
  const copyToClipboard = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    const diffMs = Date.now() - new Date(timestamp);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getAuthorFingerprint = (pkg) => {
    if (pkg.author_public_key) {
      return pkg.author_public_key.replace(/^ed25519:/, "").substring(0, 12);
    }
    return null;
  };

  const getActivityIcon = (type) =>
    ({
      publish: "📦",
      star: "⭐",
      unstar: "☆",
      fork: "🍴",
      endorse: "✓",
      observe: "👁",
      flag: "⚑",
      register: "🚀",
    })[type] || "📋";

  const getActivityColor = (type) =>
    ({
      publish: "text-orange-400 bg-orange-500/10",
      star: "text-yellow-400 bg-yellow-500/10",
      unstar: "text-zinc-400 bg-zinc-700/30",
      fork: "text-purple-400 bg-purple-500/10",
      endorse: "text-emerald-400 bg-emerald-500/10",
      observe: "text-blue-400 bg-blue-500/10",
      flag: "text-red-400 bg-red-500/10",
      register: "text-cyan-400 bg-cyan-500/10",
    })[type] || "text-zinc-400 bg-zinc-800";

  // ========== Watchers ==========
  watch(agentPropRef, () => fetchAgentDetails());
  watch(activeTab, (newTab) => {
    if (newTab === "activity" && activityTimeline.value.length === 0) {
      fetchAgentActivity();
    }
  });

  // ========== Init ==========
  onMounted(() => fetchAgentDetails());

  return {
    fullAgent,
    loading,
    activeTab,
    showFullKey,
    activityTimeline,
    activityLoading,
    keyFingerprint,
    verificationBadge,
    fetchAgentDetails,
    fetchAgentActivity,
    copyToClipboard,
    formatTimeAgo,
    getAuthorFingerprint,
    getActivityIcon,
    getActivityColor,
  };
}
