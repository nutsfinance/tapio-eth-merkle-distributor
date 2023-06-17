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

    const roleAddress = config.aggregator;
    const feeDistributorRole = await rewardCollectorForFee.DISTRIBUTOR_ROLE();
    console.log('Fee distributor role: ' + feeDistributorRole)
    const feeHasDistributorRole = await rewardCollectorForFee.hasRole(feeDistributorRole, roleAddress);
    console.log('Fee has distributor role: ' + feeHasDistributorRole);
    if (!feeHasDistributorRole) {
        const tx = await rewardCollectorForFee.grantRole(feeDistributorRole, roleAddress);
        await tx.wait();
        console.log('Fee has distributor role: ' + await rewardCollectorForFee.hasRole(feeDistributorRole, roleAddress));
    }

    const yieldDistributorRole = await rewardCollectorForYield.DISTRIBUTOR_ROLE();
    console.log('Yield distributor role: ' + yieldDistributorRole)
    const yieldHasDistributorRole = await rewardCollectorForYield.hasRole(yieldDistributorRole, roleAddress);
    console.log('Yield has distributor role: ' + yieldHasDistributorRole);
    if (!yieldHasDistributorRole) {
        const tx = await rewardCollectorForYield.grantRole(yieldDistributorRole, roleAddress);
        await tx.wait();
        console.log('Yield has distributor role: ' + await rewardCollectorForYield.hasRole(yieldDistributorRole, roleAddress));
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });
