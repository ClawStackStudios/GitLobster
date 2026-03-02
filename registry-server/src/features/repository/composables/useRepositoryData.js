import { ref, computed, watch } from "vue";
import { repositoryApi } from "../repository.api";
import { getDaysAgo } from "../../../utils/dateUtils";

/**
 * Core repository data composable.
 * Manages version selection, documentation fetching, observations, and trust helpers.
 * @param {import('vue').Ref} repoRef - Reactive reference to the repo prop
 */
export function useRepositoryData(repoRef) {
  // ========== Reactive State ==========
  const repoTab = ref("code");
  const selectedVersion = ref(repoRef.value?.version || "1.0.0");
  const availableVersions = ref([]);
  const readmeContent = ref("");
  const readmeLoading = ref(false);
  const skillDocContent = ref("");
  const skillDocLoading = ref(false);
  const observations = ref([]);
  const observationFilter = ref("all");

  // ========== Computed ==========
  const getLatestVersion = computed(() => {
    return (
      availableVersions.value[0]?.version ||
      repoRef.value?.latest ||
      repoRef.value?.version ||
      "N/A"
    );
  });

  // ========== Data Fetching ==========
  const fetchReadme = async () => {
    readmeLoading.value = true;
    try {
      readmeContent.value = await repositoryApi.getReadme(
        repoRef.value.name,
        selectedVersion.value,
      );
    } catch (e) {
      readmeContent.value = "# Error\nFailed to load README.";
    } finally {
      readmeLoading.value = false;
    }
  };

  const fetchSkillDoc = async () => {
    skillDocLoading.value = true;
    try {
      skillDocContent.value = await repositoryApi.getSkillDoc(
        repoRef.value.name,
        selectedVersion.value,
      );
    } catch (e) {
      skillDocContent.value = "# Error\nFailed to load SKILL.md.";
    } finally {
      skillDocLoading.value = false;
    }
  };

  const loadObservations = async () => {
    try {
      const data = await repositoryApi.getObservations(repoRef.value.name);
      observations.value = data.observations || [];
    } catch (e) {
      console.error("Failed to load observations", e);
    }
  };

  const loadVersion = async () => {
    // Placeholder for version-specific data fetching
  };

  // ========== Trust Helpers ==========
  const getPerms = (pkg) => {
    try {
      return JSON.parse(pkg.manifest || "{}").permissions || {};
    } catch (e) {
      return {};
    }
  };

  const hasPerms = (pkg) => Object.keys(getPerms(pkg)).length > 0;
  const getEndorsements = (pkg) => pkg.endorsement_count || 0;

  const getTrustDecayClass = (pkg) => {
    const days = getDaysAgo(pkg);
    if (days === null) return "trust-fresh";
    if (days < 30) return "trust-fresh";
    if (days < 90) return "trust-aging";
    return "trust-stale";
  };

  // ========== Initialization ==========
  const initializeData = () => {
    // Populate available versions from repo prop
    if (repoRef.value?.versions?.length > 0) {
      availableVersions.value = repoRef.value.versions;
    } else {
      availableVersions.value = [
        {
          version: repoRef.value?.version || "1.0.0",
          published_at: repoRef.value?.created_at || new Date().toISOString(),
        },
      ];
    }

    // Load observations
    if (repoRef.value?.observations) {
      observations.value = repoRef.value.observations;
    } else {
      loadObservations();
    }

    // Load README
    fetchReadme();
  };

  // ========== Watchers ==========
  watch(
    () => repoRef.value,
    (newRepo) => {
      if (newRepo) {
        selectedVersion.value = newRepo.version || "1.0.0";
        if (newRepo.versions?.length > 0) {
          availableVersions.value = newRepo.versions;
        } else {
          availableVersions.value = [
            {
              version: newRepo.version || "1.0.0",
              published_at: newRepo.created_at || new Date().toISOString(),
            },
          ];
        }
        fetchReadme();
        loadObservations();
        fetchSkillDoc();
      }
    },
  );

  watch(repoTab, (newTab) => {
    if (newTab === "readme") fetchReadme();
    if (newTab === "skill") fetchSkillDoc();
  });

  return {
    // State
    repoTab,
    selectedVersion,
    availableVersions,
    readmeContent,
    readmeLoading,
    skillDocContent,
    skillDocLoading,
    observations,
    observationFilter,
    // Computed
    getLatestVersion,
    // Actions
    fetchReadme,
    fetchSkillDoc,
    loadObservations,
    loadVersion,
    initializeData,
    // Trust helpers
    getPerms,
    hasPerms,
    getEndorsements,
    getTrustDecayClass,
  };
}
