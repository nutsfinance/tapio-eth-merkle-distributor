import { ethers } from "hardhat";
import { CONFIG } from "../config";

async function main() {
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();

    const config = CONFIG[network.name];

    const MerkleDistributor = await ethers.getContractFactory("MerkleDistributor");
    const distributor = MerkleDistributor.attach(config.merkleDistributor);

    console.log('Cycle before: ' + await distributor.currentCycle());

    // const NEW_ROOT = '0x0000000000000000000000000000000000000000000000000000000000000000';
    // const NEW_CYCLE = 1;
    // const NEW_START_BLOCK = 0;
    // const NEW_END_BLOCK = 2454000;

    // const roleAddress = '0x99537d82F6F4AAD1419dD14952B512c7959A2904';
    // const role1 = await distributor.ROOT_PROPOSER_ROLE();
    // console.log('Proposal role: ' + role1)
    // console.log('Has role: ' + await distributor.hasRole(role1, roleAddress));
    // const tx1 = await distributor.grantRole(role1, roleAddress);
    // await tx1.wait();
    // console.log('Has role: ' + await distributor.hasRole(role1, roleAddress));

    // const role2 = await distributor.ROOT_VALIDATOR_ROLE();
    // console.log('Proposal role: ' + role2)
    // console.log('Has role: ' + await distributor.hasRole(role2, roleAddress));
    // const tx2 = await distributor.grantRole(role2, roleAddress);
    // await tx2.wait();
    // console.log('Has role: ' + await distributor.hasRole(role2, roleAddress));

    // const tx3 = await distributor.proposeRoot(NEW_ROOT, ethers.utils.formatBytes32String(''), NEW_CYCLE, NEW_START_BLOCK, NEW_END_BLOCK);
    // await tx3.wait();

    console.log('Cycle after: ' + await distributor.currentCycle());
    console.log('Pending cycle: ' + await distributor.pendingCycle());
    console.log('Pending Merkle root: ' + await distributor.pendingMerkleRoot());
    console.log('Pending Merkle content hash: ' + await distributor.pendingMerkleContentHash());
    console.log('Last proposed start block: ' + await distributor.lastProposeStartBlock());
    console.log('Last proposed end block: ' + await distributor.lastProposeEndBlock());
    console.log('Last proposed timestamp: ' + await distributor.lastProposeTimestamp());
    console.log('Last published timestamp: ' + await distributor.lastPublishTimestamp());
    console.log('Last proposed block number: ' + await distributor.lastProposeBlockNumber());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });
