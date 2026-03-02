import { ref } from "vue";
import { repositoryApi } from "../repository.api";

/**
 * Version diff composable.
 * Manages diff state, transforms, evolution pairs, and caching.
 * @param {import('vue').Ref} repoRef - Reactive reference to the repo prop
 * @param {import('vue').Ref} availableVersions - Reactive ref of available versions array
 */
export function useVersionDiff(repoRef, availableVersions) {
  // ========== Reactive State ==========
  const diffViewMode = ref("compare-to-current");
  const selectedCompareVersion = ref("");
  const versionDiffs = ref({});
  const loadingDiffs = ref(new Set());
  const expandedEvolutionDiffs = ref(new Set());
  const evolutionPage = ref(1);

  // ========== Transform ==========
  const transformDiff = (diff) => {
    if (!diff || !diff.diff) return null;

    const d = diff.diff;
    return {
      riskLevel: d.risk_level?.toLowerCase() || "low",
      changeCount:
        (d.file_diff?.changed?.length || 0) +
        (d.file_diff?.added?.length || 0) +
        (d.file_diff?.removed?.length || 0),
      permissions: {
        added: d.permission_diff?.added || [],
        removed: d.permission_diff?.removed || [],
      },
      files: [
        ...(d.file_diff?.added || []).map((f) => "+ " + f.path),
        ...(d.file_diff?.changed || []).map((f) => "M " + f.path),
        ...(d.file_diff?.removed || []).map((f) => "- " + f.path),
      ],
      metadata: d.metadata_diff
        ? {
            description: d.metadata_diff.description_changed
              ? {
                  before: d.metadata_diff.description_old,
                  after: d.metadata_diff.description_new,
                }
              : null,
            tags: d.metadata_diff.tags_changed,
            changelog: d.metadata_diff.changelog,
          }
        : null,
    };
  };

  // ========== Actions ==========
  const loadVersionDiff = async (compareVersion) => {
    if (versionDiffs.value[compareVersion]) return;

    loadingDiffs.value.add(compareVersion);
    try {
      const latestVersion = availableVersions.value[0]?.version;
      if (!latestVersion) {
        console.error("No latest version available");
        return;
      }
      const diff = await repositoryApi.getDiff(
        repoRef.value.name,
        latestVersion,
        compareVersion,
      );
      versionDiffs.value[compareVersion] = transformDiff(diff);
    } catch (e) {
      console.error("Failed to load diff", e);
    } finally {
      loadingDiffs.value.delete(compareVersion);
    }
  };

  const loadEvolutionDiff = async (pair) => {
    const key = `${pair.from}-${pair.to}`;
    if (versionDiffs.value[key]) return;

    loadingDiffs.value.add(key);
    try {
      const diff = await repositoryApi.getDiff(
        repoRef.value.name,
        pair.from,
        pair.to,
      );
      versionDiffs.value[key] = transformDiff(diff);
    } catch (e) {
      console.error("Failed to load evolution diff", e);
    } finally {
      loadingDiffs.value.delete(key);
    }
  };

  // ========== Computed Helpers ==========
  const getEvolutionPairs = () => {
    const pairs = [];
    for (let i = 0; i < availableVersions.value.length - 1; i++) {
      const fromVersion = availableVersions.value[i + 1].version;
      const toVersion = availableVersions.value[i].version;
      pairs.push({
        from: fromVersion,
        to: toVersion,
        from_date: availableVersions.value[i + 1].published_at,
        to_date: availableVersions.value[i].published_at,
        _diffKey: `${fromVersion}-${toVersion}`,
      });
    }
    return pairs;
  };

  const getEvolutionDiff = (pair) => {
    return versionDiffs.value[pair._diffKey];
  };

  return {
    // State
    diffViewMode,
    selectedCompareVersion,
    versionDiffs,
    loadingDiffs,
    expandedEvolutionDiffs,
    evolutionPage,
    // Actions
    loadVersionDiff,
    loadEvolutionDiff,
    // Helpers
    getEvolutionPairs,
    getEvolutionDiff,
  };
}
