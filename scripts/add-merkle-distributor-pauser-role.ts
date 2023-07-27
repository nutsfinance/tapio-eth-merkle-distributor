import { upgrades, ethers } from "hardhat";
import { CONFIG } from "../config";

async function main() {
    const network = await ethers.provider.getNetwork();
    const config = CONFIG[network.name];

    const [deployer] = await ethers.getSigners();

    const MerkleDistributor = await ethers.getContractFactory("MerkleDistributor", deployer);
    const merkleDistributor = MerkleDistributor.attach(config.merkleDistributor);

    const roleAddress = deployer.address;
    const pauserRole = await merkleDistributor.PAUSER_ROLE();
    console.log('Pauser role: ' + pauserRole);
    const hasPauserRole = await merkleDistributor.hasRole(pauserRole, roleAddress);
    console.log('Has Pauser role: ' + hasPauserRole);
    if (!hasPauserRole) {
        const tx = await merkleDistributor.grantRole(pauserRole, roleAddress);
        await tx.wait();
        console.log('Has Pauser role: ' + await merkleDistributor.hasRole(pauserRole, roleAddress));
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });