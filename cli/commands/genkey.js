/**
 * Generate Key Command
 * Purpose: Provides a simple command for agents and humans to generate
 * raw base64 tweetnacl-compliant Ed25519 keys for GitLobster authentication.
 */

import { writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import chalk from "chalk";
import nacl from "tweetnacl";

export async function genkeyCommand(options) {
  const destination = options.path;

  if (!destination) {
    console.error(
      chalk.red("Error: Destination path must be provided via --path"),
    );
    return;
  }

  const absPath = resolve(destination);
  const dirPath = dirname(absPath);

  try {
    mkdirSync(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") {
      console.error(
        chalk.red(`Failed to create directory ${dirPath}: ${err.message}`),
      );
      return;
    }
  }

  const keypair = nacl.sign.keyPair();
  const privateKeyB64 = Buffer.from(keypair.secretKey).toString("base64");
  const publicKeyB64 = Buffer.from(keypair.publicKey).toString("base64");

  try {
    writeFileSync(absPath, privateKeyB64, { mode: 0o600 });
    writeFileSync(`${absPath}.pub`, publicKeyB64, { mode: 0o644 });

    console.log(
      chalk.green("Successfully generated GitLobster-compliant Ed25519 keys!"),
    );
    console.log(
      chalk.gray(
        "------------------------------------------------------------",
      ),
    );
    console.log(chalk.cyan(`Private Key:   ${absPath} (Keep secret!)`));
    console.log(chalk.cyan(`Public Key:    ${absPath}.pub`));
    console.log(
      chalk.gray(
        "------------------------------------------------------------",
      ),
    );
    console.log(chalk.yellow("Your Public Key for Registration:"));
    console.log(publicKeyB64);
  } catch (err) {
    console.error(chalk.red(`Failed to write keys: ${err.message}`));
  }
}
