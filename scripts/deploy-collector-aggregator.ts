import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer, distributor] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}, distributor: ${distributor.address}`);
  
  const RewardCollectorAggregator = await ethers.getContractFactory("RewardCollectorAggregator", deployer);
  const rewardCollectorAggregator = await upgrades.deployProxy(RewardCollectorAggregator, [deployer.address]);

  await rewardCollectorAggregator.deployed();

  console.log(`Reward collector aggregator ${rewardCollectorAggregator.address} is deployed`);
  const roleAddress = distributor.address;
  const role1 = await rewardCollectorAggregator.DISTRIBUTOR_ROLE();
  console.log('Distributor role: ' + role1)
  console.log('Has role: ' + await rewardCollectorAggregator.hasRole(role1, roleAddress));
  const tx1 = await rewardCollectorAggregator.grantRole(role1, roleAddress);
  await tx1.wait();
  console.log('Has role: ' + await rewardCollectorAggregator.hasRole(role1, roleAddress));
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
