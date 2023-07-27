import { upgrades, ethers } from "hardhat";
import { CONFIG } from "../config";

async function main() {
    const network = await ethers.provider.getNetwork();
    const config = CONFIG[network.name];

    const [deployer] = await ethers.getSigners();

    const MerkleDistributor = await ethers.getContractFactory("MerkleDistributor", deployer);
    const merkleDistributor = MerkleDistributor.attach(config.merkleDistributor);

    const roleAddress = deployer.address;
    const unpauserRole = await merkleDistributor.UNPAUSER_ROLE();
    console.log('Proposer role: ' + unpauserRole);
    const hasUnpauserRole = await merkleDistributor.hasRole(unpauserRole, roleAddress);
    console.log('Has proposer role: ' + hasUnpauserRole);
    if (!hasUnpauserRole) {
        const tx = await merkleDistributor.grantRole(unpauserRole, roleAddress);
        await tx.wait();
        console.log('Has proposer role: ' + await merkleDistributor.hasRole(unpauserRole, roleAddress));
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });