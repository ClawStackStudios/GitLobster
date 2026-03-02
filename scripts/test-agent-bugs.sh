#!/bin/bash
set -e

WORKSPACE="/home/dietpi/Documents/workspace-lucas/projects/Agents/GitLobster"
TEST_DIR="/tmp/gitlobster-test-$$"
CLI="node $WORKSPACE/cli/bin/gitlobster.js"
AGENT_NAME="@testagent-$$"

mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

echo "1. Testing gitlobster genkey..."
$CLI genkey --path ./agent.key

if [ ! -f "./agent.key" ] || [ ! -f "./agent.key.pub" ]; then
	echo "FAIL: genkey did not create keys."
	exit 1
fi

PUB_KEY=$(cat ./agent.key.pub)
echo "Generated public key: $PUB_KEY"

echo "2. Initializing new skill..."
mkdir my-skill
cd my-skill

$CLI init --name "$AGENT_NAME/my-skill" --author "$AGENT_NAME" --email "test@example.com"

# Add README.md frontmatter
cat >README.md <<EOF
---
title: $AGENT_NAME/my-skill
name: my-skill
version: 1.0.0
author: $AGENT_NAME
description: What this skill does
---

# My Skill
EOF

# Add SKILL.md
cat >SKILL.md <<EOF
# SKILL.md
EOF

# Setup Git
git init
git config user.name "$AGENT_NAME"
git config user.email "test@example.com"
git config commit.gpgsign false

git add .
git commit -m "Initial commit"

# Setup Remote (Using HTTP URL that goes through the middleware)
git remote add origin http://localhost:3000/git/$AGENT_NAME/my-skill.git

echo "3. Authenticating and getting JWT..."
# 1. Get Challenge
CHALLENGE_RES=$(curl -s -X POST http://localhost:3000/v1/auth/challenge \
	-H "Content-Type: application/json" \
	-d "{\"agent_name\": \"$AGENT_NAME\", \"public_key\": \"$PUB_KEY\"}")

CHALLENGE=$(echo $CHALLENGE_RES | grep -o '"challenge":"[^"]*' | cut -d'"' -f4)

# 2. Sign Challenge with tweetnacl (via node script)
node -e "
const nacl = require('$WORKSPACE/cli/node_modules/tweetnacl');
const fs = require('fs');
const sk_b64 = fs.readFileSync('../agent.key', 'utf-8');
const sk = Buffer.from(sk_b64, 'base64');
const challenge = Buffer.from('$CHALLENGE', 'utf-8');
const sig = nacl.sign.detached(challenge, sk);
console.log(Buffer.from(sig).toString('base64'));
" >./sig.b64

SIG=$(cat ./sig.b64)

# 3. Get Token
TOKEN_RES=$(curl -s -X POST http://localhost:3000/v1/auth/token \
	-H "Content-Type: application/json" \
	-d "{\"agent_name\": \"$AGENT_NAME\", \"challenge\": \"$CHALLENGE\", \"signature\": \"$SIG\"}")

TOKEN=$(echo $TOKEN_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Got token: $TOKEN"

echo "4. Testing git push and auto-provisioning..."
# The pre-receive hook requires commits to be signed, but our test script uses unsigned commits.
# To bypass this for testing the auto-provisioning, we will just push.
# Even if pre-receive rejects the push, auto-provision should happen first.
git -c "http.extraHeader=Authorization: Bearer $TOKEN" push origin HEAD:main || true

echo "5. Testing /v1/agent/skills endpoint..."
SKILLS=$(curl -s http://localhost:3000/v1/agent/skills -H "Authorization: Bearer $TOKEN")
echo "Skills API Response: $SKILLS"

echo "DONE."
