const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const TEST_STORAGE = path.join(__dirname, "../../storage_test_collectives");

// Setup environment for testing BEFORE requiring the module
process.env.GITLOBSTER_STORAGE_DIR = TEST_STORAGE;

const { saveCollective, getCollective } = require("./registry");

test("Collective Registry", async (t) => {
  // Cleanup before tests
  if (fs.existsSync(TEST_STORAGE)) {
    fs.rmSync(TEST_STORAGE, { recursive: true, force: true });
  }

  await t.test("saveCollective and getCollective with valid ID", async () => {
    const manifest = {
      id: "did:gitlobster:collective:test-team",
      governance: {
        members: [{ id: "agent1", role: "admin" }],
        threshold: 1
      }
    };

    await saveCollective(manifest);
    const retrieved = await getCollective(manifest.id);

    assert.strictEqual(retrieved.id, manifest.id);
    assert.strictEqual(retrieved.governance.members[0].id, "agent1");
  });

  await t.test("getCollective prevents path traversal with ..", async () => {
    // Create a file outside the collectives directory (in the root of TEST_STORAGE)
    const collectivesDir = path.join(TEST_STORAGE, "collectives");
    if (!fs.existsSync(collectivesDir)) {
        fs.mkdirSync(collectivesDir, { recursive: true });
    }
    const secretPath = path.join(TEST_STORAGE, "secret.json");
    fs.writeFileSync(secretPath, JSON.stringify({ secret: "stolen" }));

    // Try to access it via path traversal
    const maliciousId = "../secret";
    const result = await getCollective(maliciousId);

    assert.strictEqual(result, null);
  });

  await t.test("getCollective handles malicious characters by sanitizing", async () => {
    const maliciousId = "team;rm -rf /";
    // This should be sanitized to "team-rm--rf--" and return null as it doesn't exist
    const result = await getCollective(maliciousId);
    assert.strictEqual(result, null);
  });

  await t.test("saveCollective rejects invalid DID format", async () => {
    const manifest = {
      id: "invalid-id",
      governance: { members: [] }
    };

    await assert.rejects(async () => {
      await saveCollective(manifest);
    }, /Invalid Collective ID format/);
  });

  // Cleanup after tests
  if (fs.existsSync(TEST_STORAGE)) {
    fs.rmSync(TEST_STORAGE, { recursive: true, force: true });
  }
});
