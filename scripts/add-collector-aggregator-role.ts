import { ethers } from "hardhat";
import { CONFIG } from "../config";

async function main() {
    const asset = "steth";
    const network = await ethers.provider.getNetwork();
    const config = CONFIG[network.name];
    const poolConfig = config[asset];
    const [deployer] = await ethers.getSigners();

    const RewardCollectorAggregator = await ethers.getContractFactory("RewardCollectorAggregator");
    const rewardCollectorAggregator = RewardCollectorAggregator.attach(config.aggregator);

    const roleAddress = deployer.address;
    const role1 = await rewardCollectorAggregator.DISTRIBUTOR_ROLE();
    console.log('Proposal role1: ' + role1)
    console.log('Has role1: ' + await rewardCollectorAggregator.hasRole(role1, roleAddress));
    const tx1 = await rewardCollectorAggregator.grantRole(role1, roleAddress);
    await tx1.wait();
    console.log('Has role1: ' + await rewardCollectorAggregator.hasRole(role1, roleAddress));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });
