import { upgrades, ethers } from "hardhat";
import { CONFIG } from "../config";

async function main() {
    const network = await ethers.provider.getNetwork();
    const config = CONFIG[network.name];

    const [deployer] = await ethers.getSigners();

    const MerkleDistributor = await ethers.getContractFactory("MerkleDistributor", deployer);
    const merkleDistributor = MerkleDistributor.attach(config.merkleDistributor);

    const roleAddress = deployer.address;
    const proposerRole = await merkleDistributor.ROOT_PROPOSER_ROLE();
    console.log('Proposer role: ' + proposerRole);
    const hasProposerRole = await merkleDistributor.hasRole(proposerRole, roleAddress);
    console.log('Has proposer role: ' + hasProposerRole);
    if (!hasProposerRole) {
        const tx = await merkleDistributor.grantRole(proposerRole, roleAddress);
        await tx.wait();
        console.log('Has proposer role: ' + await merkleDistributor.hasRole(proposerRole, roleAddress));
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });