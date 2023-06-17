import { upgrades, ethers } from "hardhat";
import { CONFIG } from "../config";

async function main() {
    const network = await ethers.provider.getNetwork();
    const config = CONFIG[network.name];

    const [deployer] = await ethers.getSigners();

    const MerkleDistributor = await ethers.getContractFactory("MerkleDistributor", deployer);
    const merkleDistributor = MerkleDistributor.attach(config.merkleDistributor);

    const roleAddress = deployer.address;
    const validatorRole = await merkleDistributor.ROOT_VALIDATOR_ROLE();
    console.log('Validator role: ' + validatorRole);
    const hasValidatorRole = await merkleDistributor.hasRole(validatorRole, roleAddress);
    console.log('Has validator role: ' + hasValidatorRole);
    if (!hasValidatorRole) {
        const tx = await merkleDistributor.grantRole(validatorRole, roleAddress);
        await tx.wait();
        console.log('Has validator role: ' + await merkleDistributor.hasRole(validatorRole, roleAddress));
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });