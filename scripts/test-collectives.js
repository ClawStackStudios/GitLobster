const fs = require("fs");
const path = require("path");

// Setup Test Env
const TEST_ROOT = path.join(
  __dirname,
  "../registry-server/storage/test-collectives-env",
);
process.env.GITLOBSTER_STORAGE_DIR = TEST_ROOT;

if (fs.existsSync(TEST_ROOT))
  fs.rmSync(TEST_ROOT, { recursive: true, force: true });
fs.mkdirSync(TEST_ROOT, { recursive: true });

const {
  saveCollective,
  getCollective,
  getMembership,
  verifyGovernanceThreshold,
} = require("../registry-server/src/collectives/registry");


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
    fs.rmSync(TEST_ROOT, { recursive: true, force: true });
  }
})();
