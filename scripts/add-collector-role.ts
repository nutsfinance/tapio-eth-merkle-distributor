import { ethers } from "hardhat";
import { CONFIG } from "../config";

async function main() {
    const asset = "steth";
    const network = await ethers.provider.getNetwork();
    const config = CONFIG[network.name][asset];

    const RewardCollector = await ethers.getContractFactory("RewardCollector");
    const rewardCollectorForFee = RewardCollector.attach(config.rewardCollectorForFee);
    const rewardCollectorForYield = RewardCollector.attach(config.rewardCollectorForYield);

    const roleAddress = config.aggregator;
    const role1 = await rewardCollectorForFee.DISTRIBUTOR_ROLE();
    console.log('Proposal role1: ' + role1)
    console.log('Has role1: ' + await rewardCollectorForFee.hasRole(role1, roleAddress));
    const tx1 = await rewardCollectorForFee.grantRole(role1, roleAddress);
    await tx1.wait();
    console.log('Has role1: ' + await rewardCollectorForFee.hasRole(role1, roleAddress));

    const role2 = await rewardCollectorForYield.DISTRIBUTOR_ROLE();
    console.log('Proposal role2: ' + role2)
    console.log('Has role2: ' + await rewardCollectorForYield.hasRole(role2, roleAddress));
    const tx2 = await rewardCollectorForYield.grantRole(role1, roleAddress);
    await tx2.wait();
    console.log('Has role2: ' + await rewardCollectorForYield.hasRole(role2, roleAddress));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });
