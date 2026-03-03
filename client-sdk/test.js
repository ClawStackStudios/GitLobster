import { test, suite, before, after } from 'node:test';
import assert from 'node:assert';
import { writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import { GitLobsterClient } from './index.js';

suite('GitLobsterClient - generateAuthToken Error Paths', () => {
  let client;
  let tmpDir;
  let pemKeyPath;
  let invalidLengthKeyPath;

  before(async () => {
    client = new GitLobsterClient();

    // Create temporary files for tests
    tmpDir = tmpdir();

    pemKeyPath = join(tmpDir, `test-pem-key-${randomBytes(4).toString('hex')}.txt`);
    await writeFile(pemKeyPath, '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQ...\n-----END PRIVATE KEY-----');

    invalidLengthKeyPath = join(tmpDir, `test-invalid-len-key-${randomBytes(4).toString('hex')}.txt`);
    // 32 bytes instead of 64
    const shortKey = randomBytes(32).toString('base64');
    await writeFile(invalidLengthKeyPath, shortKey);
  });

  after(async () => {
    // Cleanup temporary files
    try { await rm(pemKeyPath); } catch (e) {}
    try { await rm(invalidLengthKeyPath); } catch (e) {}
  });

  test('throws error when private key is in PEM format', async () => {
    await assert.rejects(
      async () => {
        await client.generateAuthToken('@test/package', pemKeyPath);
      },
      (err) => {
        assert.strictEqual(err.name, 'Error');
        assert.ok(err.message.includes('PEM keys not supported. Please use raw base64 Ed25519 secret key (64 bytes).'));
        return true;
      }
    );
  });

  test('throws error when private key has invalid length', async () => {
    await assert.rejects(
      async () => {
        await client.generateAuthToken('@test/package', invalidLengthKeyPath);
      },
      (err) => {
        assert.strictEqual(err.name, 'Error');
        assert.ok(err.message.includes('Invalid Ed25519 secret key length: 32 bytes (expected 64)'));
        return true;
      }
    );
  });
});
