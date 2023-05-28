import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer, distributor] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}, distributor: ${distributor.address}`);

  const RewardCollector = await ethers.getContractFactory("RewardCollector", deployer);
  const rewardCollector = await upgrades.deployProxy(RewardCollector, [deployer.address]);

  await rewardCollector.deployed();

  console.log(`Reward collector ${rewardCollector.address} is deployed`);

  const roleAddress = distributor.address;
  rewardCollector._deployedPromise
  const role1 = await rewardCollector.DISTRIBUTOR_ROLE();
  console.log('Distributor role: ' + role1);
  console.log('Has role: ' + await rewardCollector.hasRole(role1, roleAddress));
  const tx1 = await rewardCollector.grantRole(role1, roleAddress);
  await tx1.wait();
  console.log('Has role: ' + await rewardCollector.hasRole(role1, roleAddress));

  const distributors = [distributor.address];
  for (const dis of distributors) {
    const tx2 = await rewardCollector.updateTarget(dis, true);
    await tx2.wait();
    console.log(`${dis} has target: ` + await rewardCollector.targets(dis));
  }
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
