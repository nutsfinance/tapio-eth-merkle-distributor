# Tapio Merkle Distributor

```bash
npx hardhat run scripts/deploy-1-merkle-distributor.ts --network goerli
npx hardhat run scripts/deploy-2-collector-aggregator.ts --network goerli
npx hardhat run scripts/deploy-3-collector.ts --network goerli

# Update config.ts
npx hardhat run scripts/add-collector-agergator-role.ts --network goerli
npx hardhat run scripts/add-collector-role.ts --network goerli
npx hardhat run scripts/add-collector-target.ts --network goerli
npx hardhat run scripts/add-merkle-distributor-approve-role.ts --network goerli
npx hardhat run scripts/add-merkle-distributor-proposer-role.ts --network goerli
```
