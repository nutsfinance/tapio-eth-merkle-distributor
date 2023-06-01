import { ethers } from "hardhat";
import { CONFIG } from "../config";

async function main() {
    const asset = "steth";
    const network = await ethers.provider.getNetwork();
    const config = CONFIG[network.name][asset];

    const RewardCollector = await ethers.getContractFactory("RewardCollector");
    const rewardCollectorForFee = RewardCollector.attach(config.rewardCollectorForFee);
    const rewardCollectorForYield = RewardCollector.attach(config.rewardCollectorForYield);

    console.log(`has target: ` + await rewardCollectorForFee.targets(config.merkleDistributor));
    const tx1 = await rewardCollectorForFee.updateTarget(config.merkleDistributor, true);
    await tx1.wait();
    console.log(`has target: ` + await rewardCollectorForFee.targets(config.merkleDistributor));

    console.log(`has target: ` + await rewardCollectorForYield.targets(config.merkleDistributor));
    const tx2 = await rewardCollectorForYield.updateTarget(config.merkleDistributor, true);
    await tx2.wait();
    console.log(`has target: ` + await rewardCollectorForYield.targets(config.merkleDistributor));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });
