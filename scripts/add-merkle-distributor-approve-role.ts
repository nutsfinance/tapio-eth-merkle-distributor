import { upgrades, ethers } from "hardhat";
import { CONFIG } from "../config";

async function main() {
    const network = await ethers.provider.getNetwork();
    const config = CONFIG[network.name];

    const [deployer] = await ethers.getSigners();

    const MerkleDistributor = await ethers.getContractFactory("MerkleDistributor", deployer);
    const merkleDistributor = MerkleDistributor.attach(config.merkleDistributor);

    const roleAddress = deployer.address;
    const role = await merkleDistributor.ROOT_VALIDATOR_ROLE();
    console.log('Role: ' + role)
    console.log('Has role: ' + await merkleDistributor.hasRole(role, roleAddress));
    const tx = await merkleDistributor.grantRole(role, roleAddress);
    await tx.wait();
    console.log('Has role: ' + await merkleDistributor.hasRole(role, roleAddress));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });