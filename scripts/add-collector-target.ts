import { ethers } from "hardhat";
import { CONFIG } from "../config";

async function main() {
    const asset = "steth";
    const network = await ethers.provider.getNetwork();
    const config = CONFIG[network.name];
    const poolConfig = config[asset];

    const RewardCollector = await ethers.getContractFactory("RewardCollector");
    const rewardCollectorForFee = RewardCollector.attach(poolConfig.rewardCollectorForFee);
    const rewardCollectorForYield = RewardCollector.attach(poolConfig.rewardCollectorForYield);

    const targetAddress = config.merkleDistributor;
    const feeHasTarget = await rewardCollectorForFee.targets(targetAddress);
    console.log('Fee has target: ' + feeHasTarget);
    if (!feeHasTarget) {
        const tx = await rewardCollectorForFee.updateTarget(targetAddress, true);
        await tx.wait();
        console.log('Fee has target: ' + await rewardCollectorForFee.targets(targetAddress));
    }

    const yieldHasTarget = await rewardCollectorForYield.targets(targetAddress);
    console.log('Yield has target: ' + yieldHasTarget);
    if (!yieldHasTarget) {
        const tx = await rewardCollectorForYield.updateTarget(targetAddress, true);
        await tx.wait();
        console.log('Yield has target: ' + await rewardCollectorForYield.targets(targetAddress));
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });
