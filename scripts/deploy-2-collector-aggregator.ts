import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deployer addresss: ' + deployer.address + ", balance: " + (await deployer.getBalance()).toString());
  
  const RewardCollectorAggregator = await ethers.getContractFactory("RewardCollectorAggregator", deployer);
  const rewardCollectorAggregator = await upgrades.deployProxy(RewardCollectorAggregator, [deployer.address]);

  await rewardCollectorAggregator.deployed();

  console.log(`Reward collector aggregator ${rewardCollectorAggregator.address} is deployed`);
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
