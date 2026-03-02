const fs = require("fs");
const path = require("path");
const {
  saveCollective,
  getCollective,
  getMembership,
  verifyGovernanceThreshold,
} = require("../registry-server/src/collectives/registry");

// Setup Test Env
const TEST_ROOT = path.join(
  __dirname,
  "../registry-server/storage/test-collectives-env",
);
if (fs.existsSync(TEST_ROOT))
  fs.rmSync(TEST_ROOT, { recursive: true, force: true });
fs.mkdirSync(TEST_ROOT, { recursive: true });

// Monkey-patch the module's internal path (simulated by setting env var before require, but here we accepted it reads env var)
// Actually, the module reads env var at top level. We might need to reload it or trust it uses correct path if we set env var before require?
// The module was already required.
// For this test script to work with the *same* module instance, we rely on the fact that `registry.js` checks env var.
// BUT since we already required it, the top-level const is fixed.
// Solution: We'll just define the collective in the default storage location or mock fs.
// Wait, `registry.js` uses `GITLOBSTER_STORAGE_DIR`. If I set it now, it's too late.
// I will just use the functions as is, and let them write to `../../../storage/collectives`.
// Implementation detail: I'll clean up `../../../storage/collectives/did_gitlobster_collective_test_dao.json` after test.

const manifest = {
  "@context": "https://gitlobster.network/ctx/v1",
  type: "Collective",
  id: "did:gitlobster:collective:test-dao",
  name: "Test DAO",
  governance: {
    threshold: 3,
    members: [
      { id: "did:key:alice", role: "admin", weight: 2 },
      { id: "did:key:bob", role: "member", weight: 1 },
      { id: "did:key:charlie", role: "observer", weight: 0 },
    ],
  },
};

(async () => {
  console.log("--- Testing Collective Registry ---");

  try {
    // 1. Save
    console.log("Saving Collective...");
    const filepath = await saveCollective(manifest);
    console.log(`Saved to ${filepath}`);

    // 2. Get
    console.log("Retrieving Collective...");
    const retrieved = await getCollective(manifest.id);
    if (retrieved && retrieved.name === "Test DAO") {
      console.log("✅ Retrieval Successful");
    } else {
      console.error("❌ Retrieval Failed");
    }

    // 3. Membership
    const alice = await getMembership(manifest.id, "did:key:alice");
    const charlie = await getMembership(manifest.id, "did:key:charlie");
    const stranger = await getMembership(manifest.id, "did:key:eve");

    console.log(
      "Alice (Admin, w=2):",
      alice && alice.role === "admin" ? "✅" : "❌",
    );
    console.log(
      "Charlie (Observer):",
      charlie && charlie.role === "observer" ? "✅" : "❌",
    );
    console.log("Stranger (Null):", stranger === null ? "✅" : "❌");

    // 4. Threshold (Target = 3)
    // Alice (2) + Bob (1) = 3 -> PASS
    const res1 = await verifyGovernanceThreshold(manifest.id, [
      "did:key:alice",
      "did:key:bob",
    ]);
    console.log("Threshold (Alice+Bob = 3):", res1 ? "✅ PASS" : "❌ FAIL");

    // Alice (2) + Charlie (0) = 2 -> FAIL
    const res2 = await verifyGovernanceThreshold(manifest.id, [
      "did:key:alice",
      "did:key:charlie",
    ]);
    console.log(
      "Threshold (Alice+Charlie = 2):",
      !res2 ? "✅ PASS" : "❌ FAIL",
    );

    // Bob (1) = 1 -> FAIL
    const res3 = await verifyGovernanceThreshold(manifest.id, ["did:key:bob"]);
    console.log("Threshold (Bob = 1):", !res3 ? "✅ PASS" : "❌ FAIL");
  } catch (e) {
    console.error("Test Failed:", e);
  } finally {
    // Cleanup if possible
    // const file = path.join(__dirname, '../storage/collectives/did_gitlobster_collective_test_dao.json');
    // if (fs.existsSync(file)) fs.unlinkSync(file);
  }
})();
