import { ethers } from "hardhat";
import { CONFIG } from "../config";

async function main() {
    const [deployer] = await ethers.getSigners();

    const network = await ethers.provider.getNetwork();
    const config = CONFIG[network.name];

    const MerkleDistributor = await ethers.getContractFactory("MerkleDistributor");
    const merkleDistributor = MerkleDistributor.attach(config.merkleDistributor);
    console.log('Cycle before: ' + await merkleDistributor.currentCycle());

    // const NEW_ROOT = '0x1fd3f56813e201af91d175a17e47916e1afab871abb50505e2280d6a93352d0e';
    // const NEW_CYCLE = 28;
    // const NEW_START_BLOCK = 2942600;
    // const NEW_END_BLOCK = 2993600;
    // const tx1 = await merkleDistributor.approveRoot(NEW_ROOT, ethers.utils.formatBytes32String(''), NEW_CYCLE, NEW_START_BLOCK, NEW_END_BLOCK);
    // await tx1.wait();

    console.log('Cycle after: ' + await merkleDistributor.currentCycle());
    console.log('Merkle root: ' + await merkleDistributor.merkleRoot());
    console.log('Merkle content hash: ' + await merkleDistributor.merkleContentHash());
    console.log('Last publish start block: ' + await merkleDistributor.lastPublishStartBlock());
    console.log('Last publish end block: ' + await merkleDistributor.lastPublishEndBlock());
    console.log('Last publish timestamp: ' + await merkleDistributor.lastPublishTimestamp());
    console.log('Last publish block number: ' + await merkleDistributor.lastPublishBlockNumber());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });