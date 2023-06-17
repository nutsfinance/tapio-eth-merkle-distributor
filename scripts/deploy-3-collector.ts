import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deployer addresss: ' + deployer.address + ", balance: " + (await deployer.getBalance()).toString());

  const RewardCollector = await ethers.getContractFactory("RewardCollector", deployer);
  const rewardCollector = await upgrades.deployProxy(RewardCollector, [deployer.address]);

  await rewardCollector.deployed();

  console.log(`Reward collector ${rewardCollector.address} is deployed`);
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
