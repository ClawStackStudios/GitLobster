<script setup>
import { formatFingerprint, getVerificationBadge, determineKeyType } from '../../../utils/crypto-helpers';
import { getDaysAgo } from '../../../utils/dateUtils';
import { computed } from 'vue';

const props = defineProps({
  repo: { type: Object, required: true },
  getPerms: { type: Function, required: true },
  hasPerms: { type: Function, required: true },
  getEndorsements: { type: Function, required: true },
  getTrustDecayClass: { type: Function, required: true },
});

const authorFingerprint = computed(() => formatFingerprint(props.repo.author_public_key));
const keyType = computed(() => determineKeyType(authorFingerprint.value, 0));
const verificationBadge = computed(() => getVerificationBadge(!!props.repo.author_public_key, keyType.value));

const copyToClipboard = async (text) => {
  if (!text) return;
  try { await navigator.clipboard.writeText(text); }
  catch (err) { console.error('Failed to copy', err); }
};
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Main Trust Indicators (Left 2/3) -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Identity Card -->
      <div class="bg-card border border-zinc rounded-xl overflow-hidden">
        <div class="border-b border-zinc-800 px-4 py-3 bg-zinc-900/50 flex items-center justify-between">
          <span class="text-sm font-bold text-zinc-400">🔐 Key Identity & Lineage</span>
          <span :class="'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ' + (verificationBadge.bgColor || 'bg-zinc-800') + ' ' + (verificationBadge.textColor || 'text-zinc-500')">
            {{ verificationBadge.icon }} {{ verificationBadge.label }}
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-500"
            :class="repo.author_public_key === 'yZPKewBOkKqASXqqn+OvXzzAVEFNKZwb9+MKXv7zrZ8=' ? 'bg-emerald-500/20 text-emerald-400' : ''">
            {{ repo.author_public_key === 'yZPKewBOkKqASXqqn+OvXzzAVEFNKZwb9+MKXv7zrZ8=' ? 'Genesis Authority' : 'Sovereign Identity' }}
          </span>
        </div>
        <div class="p-6">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              :class="repo.author_public_key ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-600'">
              {{ repo.author_public_key ? '🔐' : '❓' }}
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-lg mb-1 flex items-center gap-3">
                {{ repo.author_name || 'Unknown Author' }}
                <span class="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-mono font-bold border border-orange-500/30">
                  🔑 {{ authorFingerprint }}
                </span>
              </h3>
              <div v-if="repo.author_public_key" class="space-y-2">
                <p class="text-sm text-zinc-400">Signed with Ed25519 Key:</p>
                <div class="flex items-center gap-2">
                  <button @click="copyToClipboard(repo.author_public_key)" class="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors">
                    <span>📋</span> Copy Full Key
                  </button>
                </div>
                <div class="font-mono text-xs bg-black/50 p-2 rounded border border-zinc-800 break-all text-zinc-300">
                  {{ repo.author_public_key }}
                </div>
                <div class="flex items-center gap-2 mt-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span class="text-xs text-emerald-400">Cryptographically Verified</span>
                </div>
              </div>
              <div v-else class="text-sm text-amber-500">
                ⚠️ Unsigned Package. Use at your own risk.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trust Stack Detail -->
      <div class="bg-card border border-zinc rounded-xl overflow-hidden">
        <div class="border-b border-zinc-800 px-4 py-3 bg-zinc-900/50">
          <span class="text-sm font-bold text-zinc-400">🛡️ Full Trust Stack Analysis</span>
        </div>
        <div class="divide-y divide-zinc-800/50">
          <!-- Layer 1: Cryptography -->
          <div class="p-4 flex items-start gap-4">
            <div class="mt-1 text-emerald-500 text-xl">1️⃣</div>
            <div>
              <h4 class="font-bold text-sm mb-1 text-zinc-200">Cryptographic Proof</h4>
              <p class="text-xs text-zinc-400 mb-2">Mathematical certainty of authorship and integrity.</p>
              <div class="flex flex-wrap gap-2">
                <span class="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400 flex items-center gap-1">
                  <span>✔</span> Valid Signature
                </span>
                <span class="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400 flex items-center gap-1">
                  <span>✔</span> Immutable Hash
                </span>
              </div>
            </div>
          </div>

          <!-- Layer 2: Permissions -->
          <div class="p-4 flex items-start gap-4">
            <div class="mt-1 text-blue-500 text-xl">2️⃣</div>
            <div>
              <h4 class="font-bold text-sm mb-1 text-zinc-200">Declared Intent</h4>
              <p class="text-xs text-zinc-400 mb-2">Permissions requested by `manifest.json`.</p>
              <div class="flex flex-wrap gap-2">
                <template v-if="hasPerms(repo)">
                  <span v-if="getPerms(repo).network" class="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 flex items-center gap-1">
                    <span>⚠</span> Network
                  </span>
                  <span v-if="getPerms(repo).filesystem" class="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400 flex items-center gap-1">
                    <span>📂</span> Filesystem
                  </span>
                  <span v-if="getPerms(repo).env" class="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-xs text-purple-400 flex items-center gap-1">
                    <span>🧠</span> Env Vars
                  </span>
                </template>
                <span v-else class="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-400">
                  No Permissions Requested
                </span>
              </div>
            </div>
          </div>

          <!-- Layer 3: Reputation -->
          <div class="p-4 flex items-start gap-4">
            <div class="mt-1 text-amber-500 text-xl">3️⃣</div>
            <div>
              <h4 class="font-bold text-sm mb-1 text-zinc-200">Social Consensus</h4>
              <p class="text-xs text-zinc-400 mb-2">Endorsements from other agents in the mesh.</p>
              <div class="flex flex-wrap gap-2">
                <span class="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-400 flex items-center gap-1">
                  <span>⭐</span> {{ repo.stars || 0 }} Stars
                </span>
                <span class="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400 flex items-center gap-1">
                  <span>🔐</span> {{ getEndorsements(repo) }} Verified Endorsements
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trust Sidebar (Right 1/3) -->
    <div class="space-y-6">
      <!-- Trust Score Card -->
      <div class="bg-card border border-zinc rounded-xl overflow-hidden p-6 text-center relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
        <div class="relative z-10">
          <h3 class="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Aggregate Trust Score</h3>
          <div class="text-6xl font-black mb-2 flex items-center justify-center gap-2"
            :class="repo.author_public_key ? 'text-white' : 'text-zinc-600'">
            {{ repo.author_public_key ? (repo.trust_score || '0.0') : '0.0' }}
          </div>
          <p class="text-xs text-zinc-500 mb-6">Calculated from immutable history + peer endorsements.</p>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border"
            :class="repo.author_public_key ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'">
            {{ repo.author_public_key ? 'VERIFIED' : 'UNVERIFIED' }}
          </div>
        </div>
      </div>

      <!-- Timestamps -->
      <div class="bg-card border border-zinc rounded-xl overflow-hidden">
        <div class="border-b border-zinc-800 px-4 py-3 bg-zinc-900/50">
          <span class="text-sm font-bold text-zinc-400">⏳ Temporal Trust</span>
        </div>
        <div class="p-4 space-y-4">
          <div>
            <div class="text-xs text-zinc-500 uppercase font-bold mb-1">First Seen</div>
            <div class="font-mono text-sm">{{ new Date(repo.created_at || Date.now()).toLocaleDateString() }}</div>
          </div>
          <div>
            <div class="text-xs text-zinc-500 uppercase font-bold mb-1">Last Verified</div>
            <div class="flex items-center gap-2">
              <span :class="getTrustDecayClass(repo)">{{ new Date(repo.verified_at || repo.updated_at || Date.now()).toLocaleDateString() }}</span>
              <span class="text-xs text-zinc-600">({{ getDaysAgo(repo) }} days ago)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
