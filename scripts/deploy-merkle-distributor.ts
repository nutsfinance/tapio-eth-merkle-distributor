import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with the account: ${deployer.address}, distributor: ${deployer.address}`);

    console.log('Deployer addresss: ' + deployer.address + ", balance: " + (await deployer.getBalance()).toString());

    const MerkleDistributor = await ethers.getContractFactory("MerkleDistributor", deployer);
    const merkleDistributor = await upgrades.deployProxy(MerkleDistributor, [deployer.address, deployer.address, deployer.address]);

    console.log('Merkle distributor: ' + merkleDistributor.address);
    console.log('Current cycle: ' + (await merkleDistributor.currentCycle()));

    const role = await merkleDistributor.ROOT_PROPOSER_ROLE();
    console.log('Role: ' + role)
    console.log('Has role: ' + await merkleDistributor.hasRole(role, deployer.address));
    const tx = await merkleDistributor.grantRole(role, deployer.address);
    await tx.wait();
    console.log('Has role: ' + await merkleDistributor.hasRole(role, deployer.address));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });