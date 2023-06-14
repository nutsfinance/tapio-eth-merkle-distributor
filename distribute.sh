#!/usr/bin/env bash
set -euo pipefail
npx hardhat run rewards/run_tapeth.ts --network goerli
#npx hardhat run rewards/run_tapeth.ts --network ethereum
