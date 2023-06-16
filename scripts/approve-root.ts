import { ethers } from "hardhat";
import { CONFIG } from "../config";

async function main() {
    const [deployer] = await ethers.getSigners();

    const network = await ethers.provider.getNetwork();
    const config = CONFIG[network.name];

    const MerkleDistributor = await ethers.getContractFactory("MerkleDistributor");
    const merkleDistributor = MerkleDistributor.attach(config.merkleDistributor);

    const hasPendingRoot = await merkleDistributor.hasPendingRoot();
    console.log('hasPendingRoot: ' + hasPendingRoot);

    if (!hasPendingRoot) {
        console.log('No pending root, exit ');
        return;
    }

    console.log('Cycle before: ' + await merkleDistributor.currentCycle());

    const pendingMerkleData = await merkleDistributor.getPendingMerkleData();
    const pendingCycle = await merkleDistributor.pendingCycle();
    console.log('PendingCycle: ' + pendingCycle);
    console.log('PendingMerkleRoot: ' + pendingMerkleData.root);
    console.log('PendingMerkleContentHash: ' + pendingMerkleData.contentHash);
    console.log('LastProposeTimestamp: ' + pendingMerkleData.timestamp);
    console.log('LastProposeBlockNumber: ' + pendingMerkleData.publishBlock);
    console.log('LastProposeStartBlock: ' + pendingMerkleData.startBlock);
    console.log('LastProposeEndBlock: ' + pendingMerkleData.endBlock);

    const tx1 = await merkleDistributor.approveRoot(pendingMerkleData.root, ethers.utils.formatBytes32String(''), pendingCycle, pendingMerkleData.startBlock, pendingMerkleData.endBlock);
    await tx1.wait();

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