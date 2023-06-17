import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deployer addresss: ' + deployer.address + ", balance: " + (await deployer.getBalance()).toString());

    const MerkleDistributor = await ethers.getContractFactory("MerkleDistributor", deployer);
    const merkleDistributor = await upgrades.deployProxy(MerkleDistributor, [deployer.address, deployer.address, deployer.address]);

    await merkleDistributor.deployed();

    console.log(`Merkle distributor ${merkleDistributor.address} is deployed`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });