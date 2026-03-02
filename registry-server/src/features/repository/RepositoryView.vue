<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { formatFingerprint, getVerificationBadge, determineKeyType } from '../../utils/crypto-helpers';
import { repositoryApi } from './repository.api';
import { getDaysAgo, getTimeRemaining } from '../../utils/dateUtils';

// Composables
import { useRepositoryData } from './composables/useRepositoryData';
import { useVersionDiff } from './composables/useVersionDiff';

// Tab Components
import CodeTab from './components/CodeTab.vue';
import TrustTab from './components/TrustTab.vue';
import DocumentationTab from './components/DocumentationTab.vue';
import SkillDocTab from './components/SkillDocTab.vue';
import ObservationsTab from './components/ObservationsTab.vue';
import VersionsTab from './components/VersionsTab.vue';
import DiffsTab from './components/DiffsTab.vue';
import LineageTab from './components/LineageTab.vue';
import ForksTab from './components/ForksTab.vue';

// ========== Props & Emits ==========
const props = defineProps({
    repo: { type: Object, required: true },
    userStarred: { type: Boolean, default: false }
});

const emit = defineEmits(['back', 'update:repo', 'star', 'fork', 'view-file', 'download', 'view-fork']);

// ========== Composable Initialization ==========
const repoRef = computed(() => props.repo);

const {
    repoTab, selectedVersion, availableVersions,
    readmeContent, readmeLoading, skillDocContent, skillDocLoading,
    observations, observationFilter, getLatestVersion,
    fetchReadme, fetchSkillDoc, loadObservations, loadVersion,
    initializeData,
    getPerms, hasPerms, getEndorsements, getTrustDecayClass,
} = useRepositoryData(repoRef);

const {
    diffViewMode, selectedCompareVersion, versionDiffs,
    loadingDiffs, expandedEvolutionDiffs, evolutionPage,
    loadVersionDiff, loadEvolutionDiff,
    getEvolutionPairs, getEvolutionDiff,
} = useVersionDiff(repoRef, availableVersions);

// ========== Lineage State (shared between Lineage + Forks tabs) ==========
const lineageData = ref(null);
const lineageLoading = ref(false);
const lineageError = ref(null);

const loadLineage = async () => {
    if (!props.repo?.name) return;
    lineageLoading.value = true;
    lineageError.value = null;
    try {
        lineageData.value = await repositoryApi.getLineage(props.repo.name, 'both', 5);
    } catch (e) {
        lineageError.value = e.message;
        lineageData.value = null;
    } finally {
        lineageLoading.value = false;
    }
};

watch(repoTab, (newTab) => {
    if (newTab === 'lineage' || newTab === 'forks') loadLineage();
});

// ========== Lifecycle ==========
onMounted(() => {
    initializeData();
});

// ========== UI Action Handlers ==========
const goExplore = () => emit('back');
const openStarModal = () => emit('star');
const openForkModal = () => emit('fork');
const viewRawFile = (payload) => emit('view-file', payload);
const showSafetyWarning = (url) => emit('download', url);

const openObservationModal = () => {
    console.log('Open observation modal');
};

const copyToClipboard = async (text) => {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); }
    catch (err) { console.error('Failed to copy', err); }
};

// ========== Crypto Identity (used in header) ==========
const authorFingerprint = computed(() => formatFingerprint(props.repo.author_public_key));
const keyType = computed(() => determineKeyType(authorFingerprint.value, 0));
const verificationBadge = computed(() => getVerificationBadge(!!props.repo.author_public_key, keyType.value));

// ========== Tab Event Handlers ==========
const handleSelectVersion = (version) => {
    selectedVersion.value = version;
    loadVersion();
};

const handleToggleEvolutionExpand = ({ pair, idx }) => {
    if (expandedEvolutionDiffs.value.has(idx)) {
        expandedEvolutionDiffs.value.delete(idx);
    } else {
        expandedEvolutionDiffs.value.add(idx);
        loadEvolutionDiff(pair);
    }
};

// ========== Tab Definitions ==========
const tabs = [
    { key: 'code', icon: '📁', label: 'Code' },
    { key: 'observations', icon: '📋', label: 'Observations', badge: true },
    { key: 'readme', icon: '📖', label: 'README.md' },
    { key: 'skill', icon: '🧠', label: 'SKILL.md' },
    { key: 'versions', icon: '🏷️', label: 'Versions' },
    { key: 'trust', icon: '🛡️', label: 'Trust' },
    { key: 'diffs', icon: '📊', label: 'Diffs' },
    { key: 'lineage', icon: '🔗', label: 'Lineage' },
    { key: 'forks', icon: '🔀', label: 'Forks', forkBadge: true },
];
</script>

<template>
    <div class="max-w-7xl mx-auto">
        <!-- ==================== REPO HEADER ==================== -->
        <div class="mb-8">
            <!-- Security Cooldown Banner -->
            <div v-if="repo.cooldown && repo.cooldown.active"
                class="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center text-xl animate-pulse">⏳</div>
                    <div>
                        <h4 class="font-bold text-amber-500 uppercase tracking-wider text-xs mb-1">Permission Escalation Safety Lock</h4>
                        <p class="text-sm text-zinc-300">New permissions are pending adoption. {{ repo.cooldown.reason }}</p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-black text-white mono">{{ getTimeRemaining(repo.cooldown.unlocks_at) }}</div>
                    <div class="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Time to Unlock</div>
                </div>
            </div>

            <!-- Breadcrumb -->
            <div class="flex items-center gap-2 text-sm mb-4">
                <button @click="goExplore" class="text-zinc-500 hover:text-white transition-colors">Explore</button>
                <span class="text-zinc-700">/</span>
                <span class="text-orange-500 font-bold">@{{ repo.author_name || 'unknown' }}</span>
                <span class="text-zinc-700">/</span>
                <span class="text-white font-bold">{{ repo.name }}</span>
            </div>

            <!-- Repo Title Bar -->
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 lobster-gradient rounded-2xl flex items-center justify-center text-3xl shadow-lg">📦</div>
                    <div>
                        <h1 class="text-3xl font-black tracking-tight flex items-center gap-3">
                            {{ repo.name }}
                            <span class="text-zinc-600 text-lg font-normal">v{{ selectedVersion || repo.latest || repo.version || '1.0.0' }}</span>
                        </h1>
                        <div class="flex items-center gap-3 mt-1">
                            <p class="text-zinc-400">{{ repo.description }}</p>
                            <span v-if="repo.is_fork"
                                class="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs font-bold text-purple-400 flex items-center gap-1">
                                <span>🔀</span> Forked from {{ repo.parent_package }}
                            </span>
                            <span v-if="repo.fork_count > 0"
                                class="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-bold text-zinc-400 flex items-center gap-1">
                                <span>🔀</span> {{ repo.fork_count }} fork{{ repo.fork_count !== 1 ? 's' : '' }}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <!-- Star Button -->
                    <button @click="openStarModal"
                        class="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors flex items-center gap-2 group">
                        <span class="text-xl">{{ userStarred ? '⭐' : '☆' }}</span>
                        <div class="flex flex-col items-start">
                            <span class="text-xs text-zinc-400">{{ repo.stars || 0 }} stars</span>
                            <span class="text-xs text-green-400 flex items-center gap-1">
                                <span class="opacity-60">🔐</span>
                                <span>{{ repo.agent_stars || 0 }} agent-verified</span>
                            </span>
                        </div>
                    </button>
                    <!-- Fork Button -->
                    <button @click="openForkModal"
                        class="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors flex items-center gap-2 group">
                        <span class="text-xl">🔀</span>
                        <div class="flex flex-col items-start">
                            <span class="text-xs text-zinc-400">Fork</span>
                            <span class="text-xs text-purple-400 flex items-center gap-1">
                                <span>{{ repo.fork_count || 0 }} forks</span>
                            </span>
                        </div>
                    </button>
                    <!-- Download -->
                    <button @click="showSafetyWarning('/v1/packages/' + encodeURIComponent(repo.name) + '/latest/tarball')"
                        class="px-4 py-2 lobster-gradient text-black font-black rounded-lg text-sm transition-transform active:scale-95 flex items-center gap-2">
                        <span>↓</span>
                        <span>Download</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- ==================== TAB NAVIGATION ==================== -->
        <div class="border-b border-zinc-800 mb-6">
            <div class="flex gap-1">
                <button v-for="tab in tabs" :key="tab.key"
                    @click="repoTab = tab.key"
                    :class="repoTab === tab.key ? 'border-orange-500 text-white' : 'border-transparent text-zinc-500 hover:text-white'"
                    class="px-4 py-3 border-b-2 font-bold text-sm transition-colors flex items-center gap-2">
                    <span>{{ tab.icon }}</span> {{ tab.label }}
                    <!-- Observation badge -->
                    <template v-if="tab.badge">
                        <span v-if="observations && observations.length > 0"
                            class="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold">
                            {{ observations.length }}
                        </span>
                        <span v-else class="px-2 py-0.5 bg-zinc-800 rounded-full text-xs">0</span>
                    </template>
                    <!-- Fork badge -->
                    <span v-if="tab.forkBadge && repo.fork_count > 0"
                        class="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold">
                        {{ repo.fork_count }}
                    </span>
                </button>
            </div>
        </div>

        <!-- ==================== TAB CONTENT ==================== -->
        <CodeTab v-if="repoTab === 'code'"
            :repo="repo" :selected-version="selectedVersion" :available-versions="availableVersions"
            :get-perms="getPerms" :has-perms="hasPerms" :get-endorsements="getEndorsements" :get-trust-decay-class="getTrustDecayClass"
            @update:selected-version="selectedVersion = $event" @load-version="loadVersion"
            @view-file="viewRawFile" @download="showSafetyWarning" />

        <TrustTab v-if="repoTab === 'trust'"
            :repo="repo"
            :get-perms="getPerms" :has-perms="hasPerms" :get-endorsements="getEndorsements" :get-trust-decay-class="getTrustDecayClass" />

        <DocumentationTab v-show="repoTab === 'readme'"
            :content="readmeContent" :loading="readmeLoading" />

        <SkillDocTab v-show="repoTab === 'skill'"
            :content="skillDocContent" :loading="skillDocLoading" />

        <ObservationsTab v-show="repoTab === 'observations'"
            :observations="observations" :observation-filter="observationFilter"
            @update:observation-filter="observationFilter = $event"
            @new-observation="openObservationModal" />

        <VersionsTab v-if="repoTab === 'versions'"
            :repo="repo" :available-versions="availableVersions"
            @select-version="handleSelectVersion" @download="showSafetyWarning" />

        <DiffsTab v-if="repoTab === 'diffs'"
            :repo="repo" :available-versions="availableVersions" :get-latest-version="getLatestVersion"
            :diff-view-mode="diffViewMode" :selected-compare-version="selectedCompareVersion"
            :version-diffs="versionDiffs" :loading-diffs="loadingDiffs"
            :expanded-evolution-diffs="expandedEvolutionDiffs" :evolution-page="evolutionPage"
            :get-evolution-pairs="getEvolutionPairs" :get-evolution-diff="getEvolutionDiff"
            @update:diff-view-mode="diffViewMode = $event"
            @update:selected-compare-version="selectedCompareVersion = $event"
            @update:evolution-page="evolutionPage = $event"
            @load-version-diff="loadVersionDiff"
            @load-evolution-diff="loadEvolutionDiff"
            @toggle-evolution-expand="handleToggleEvolutionExpand" />

        <LineageTab v-if="repoTab === 'lineage'"
            :repo="repo" :lineage-data="lineageData" :lineage-loading="lineageLoading" :lineage-error="lineageError" />

        <ForksTab v-if="repoTab === 'forks'"
            :repo="repo" :lineage-data="lineageData" :lineage-loading="lineageLoading"
            @view-fork="$emit('view-fork', $event)" />
    </div>
</template>
