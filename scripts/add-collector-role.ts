import { ethers } from "hardhat";
import { CONFIG } from "../config";

async function main() {
    const network = await ethers.provider.getNetwork();
    const config = CONFIG[network.name]["tapeth"];

    const RewardCollector = await ethers.getContractFactory("RewardCollector");
    const collector = RewardCollector.attach(config.rewardCollectorForFee);

    const roleAddress = '0x3b39D26fe2FF9BA979FA75DEa4a2B1876158fbfb';
    const role1 = await collector.DISTRIBUTOR_ROLE();
    console.log('Proposal role: ' + role1)
    console.log('Has role: ' + await collector.hasRole(role1, roleAddress));
    const tx1 = await collector.grantRole(role1, roleAddress);
    await tx1.wait();
    console.log('Has role: ' + await collector.hasRole(role1, roleAddress));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });
