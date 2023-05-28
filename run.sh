#!/usr/bin/env bash
set -o pipefail
DATE=$(date '+%Y-%m-%d-%H')
export LOG_FILE=${DATE}_stdout.log
export ERROR_LOG_FILE=${DATE}_stderr.log
./distribute.sh 2>${ERROR_LOG_FILE} | tee ${LOG_FILE}
EXIT_CODE=$?
npx hardhat run rewards/upload_log.ts --network goerli
exit $EXIT_CODE
