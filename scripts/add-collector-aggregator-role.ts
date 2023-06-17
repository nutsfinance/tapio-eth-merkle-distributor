import { ethers } from "hardhat";
import { CONFIG } from "../config";

async function main() {
    const network = await ethers.provider.getNetwork();
    const config = CONFIG[network.name];
    const [deployer] = await ethers.getSigners();

    const RewardCollectorAggregator = await ethers.getContractFactory("RewardCollectorAggregator");
    const rewardCollectorAggregator = RewardCollectorAggregator.attach(config.aggregator);

    const roleAddress = deployer.address;
    const distributorRole = await rewardCollectorAggregator.DISTRIBUTOR_ROLE();
    console.log('Distributor role: ' + distributorRole)
    const hasDistributorRole = await rewardCollectorAggregator.hasRole(distributorRole, roleAddress);
    console.log('Has distributor role: ' + hasDistributorRole);
    if (!hasDistributorRole) {
        const tx = await rewardCollectorAggregator.grantRole(distributorRole, roleAddress);
        await tx.wait();
        console.log('Has distributor role: ' + await rewardCollectorAggregator.hasRole(distributorRole, roleAddress));
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });
