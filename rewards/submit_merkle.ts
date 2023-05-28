import { ethers } from "hardhat";
import { CONFIG } from "../config";
import { fileExists, getFile } from "./lib/aws_utils";
import { BN } from 'bn.js'
import * as dotenv from 'dotenv';

dotenv.config();

export const submitMerkle = async (asset: string, automated: boolean) => {
    const network = await ethers.provider.getNetwork();
    const config = CONFIG[network.name]["tapeth"];

    const [deployer, distributor] = await ethers.getSigners();

    // Get the current cycle
    const merkleDistributorAbi = (await ethers.getContractFactory("MerkleDistributor")).interface;
    const merkleDistributor = new ethers.Contract(config.merkleDistributor, merkleDistributorAbi, deployer);
    const currentCycle = (await merkleDistributor.currentCycle()).toNumber();

    console.log(`Current cycle: ${currentCycle}`);

    const newMerkleFile = `merkles/${network.name}_${asset}_${currentCycle + 1}.json`;
    const newMerkleTree = await getFile(newMerkleFile);
    const oldMerkleFile = `merkles/${network.name}_${asset}_${currentCycle}.json`;
    const oldMerkleTree = (await fileExists(oldMerkleFile)) ? await getFile(oldMerkleFile) : {};

    const oldMerkleTotal = oldMerkleTree.tokenTotals || {};
    const newMerkleTotal = newMerkleTree.tokenTotals;
    const feeTokens = [];
    const feeAmounts = [];
    const otherTokens = [];
    const otherAmounts = [];
    for (const key in newMerkleTotal) {
        let oldValue = new BN(oldMerkleTotal[key] || "0");
        let value = newMerkleTotal[key];
        let diff = new BN(value).sub(oldValue);
        if (diff.gt(new BN(0))) {
            if (key == config.feeAddress) {
                feeTokens.push(key);
                feeAmounts.push(diff.toString());
            } else {
                otherTokens.push(key);
                otherAmounts.push(diff.toString());
            }
            console.log(key, diff.toString());
        }
    }
    console.log(`feeTokens: ${feeTokens}, feeAmounts: ${feeAmounts}, otherTokens: ${otherTokens}, otherAmounts: ${otherAmounts}`);
    console.log(`Reward collector address for fee/yield: ${config.rewardCollectorForFee}`);
    if (config.rewardCollectorForOther) {
        console.log(`Reward collector address for other: ${config.rewardCollectorForOther}`);
    }

    console.log(`Proposing cycle: ${currentCycle + 1}: root = ${newMerkleTree.merkleRoot}, start = ${newMerkleTree.startBlock}, end = ${newMerkleTree.endBlock}`);

    const tx1 = await merkleDistributor.proposeRoot(newMerkleTree.merkleRoot, ethers.utils.formatBytes32String(''), currentCycle + 1, newMerkleTree.startBlock, newMerkleTree.endBlock);
    await tx1.wait();

    console.log('Cycle after proposal: ' + await merkleDistributor.currentCycle());
    console.log('Pending cycle: ' + await merkleDistributor.pendingCycle());
    console.log('Pending Merkle root: ' + await merkleDistributor.pendingMerkleRoot());
    console.log('Pending Merkle content hash: ' + await merkleDistributor.pendingMerkleContentHash());
    console.log('Last proposed start block: ' + await merkleDistributor.lastProposeStartBlock());
    console.log('Last proposed end block: ' + await merkleDistributor.lastProposeEndBlock());
    console.log('Last proposed timestamp: ' + await merkleDistributor.lastProposeTimestamp());
    console.log('Last proposed block number: ' + await merkleDistributor.lastProposeBlockNumber());

    if (automated) {
        if (config.aggregator) {
            console.log(`Reward collector aggregator address: ${config.aggregator}`);
            const rewardCollectorAggregatorAbi = (await ethers.getContractFactory("RewardCollectorAggregator")).interface;
            const aggregator = new ethers.Contract(config.aggregator, rewardCollectorAggregatorAbi, distributor);
            const roleAddress = distributor.address;
            const role1 = await aggregator.DISTRIBUTOR_ROLE();
            console.log('Proposal role1: ' + role1)
            console.log('Has role1: ' + await aggregator.hasRole(role1, roleAddress));

            const rewardCollectorAbi = (await ethers.getContractFactory("RewardCollector")).interface;
            const rewardCollectorForFee = new ethers.Contract(config.rewardCollectorForFee, rewardCollectorAbi, distributor);
            const role2 = await rewardCollectorForFee.DISTRIBUTOR_ROLE();
            console.log('Proposal role2: ' + role2)
            console.log('Has role2: ' + await rewardCollectorForFee.hasRole(role2, roleAddress));

            const rewardCollectorForOther = new ethers.Contract(config.rewardCollectorForOther,
                rewardCollectorAggregatorAbi, distributor);
            const role3 = await rewardCollectorForFee.DISTRIBUTOR_ROLE();
            console.log('Proposal role3: ' + role3)
            console.log('Has role3: ' + await rewardCollectorForOther.hasRole(role3, roleAddress));

            const tx2 = await aggregator.distribute(config.merkleDistributor, config.rewardCollectorForFee, 
                config.rewardCollectorForOther,
                feeTokens, feeAmounts, otherTokens, otherAmounts);
            await tx2.wait();
            console.log("all rewards distributed");
        } else {
            console.log(`Reward collector address for fee/yield: ${config.rewardCollectorForFee}`);
            const rewardCollectorAbi = (await ethers.getContractFactory("RewardCollector")).interface;
            const rewardCollector = new ethers.Contract(config.rewardCollectorForFee, rewardCollectorAbi, distributor);
            const roleAddress = distributor.address;
            const role1 = await rewardCollector.DISTRIBUTOR_ROLE();
            console.log('Proposal role1: ' + role1)
            console.log('Has role1: ' + await rewardCollector.hasRole(role1, roleAddress));

            const rewardCollectorForFee = new ethers.Contract(config.rewardCollectorForFee, rewardCollectorAbi, distributor);
            const role2 = await rewardCollectorForFee.DISTRIBUTOR_ROLE();
            console.log('Proposal role2: ' + role2)
            console.log('Has role2: ' + await rewardCollectorForFee.hasRole(role2, roleAddress));

            const tx2 = await rewardCollector.distribute(config.merkleDistributor, feeTokens, feeAmounts);
            await tx2.wait();
            console.log("fee/yield distributed");
        }

        const tx3 = await merkleDistributor.approveRoot(newMerkleTree.merkleRoot, ethers.utils.formatBytes32String(''), currentCycle + 1, newMerkleTree.startBlock, newMerkleTree.endBlock);
        await tx3.wait();

        console.log('Cycle after approval: ' + await merkleDistributor.currentCycle());
        console.log('Merkle root: ' + await merkleDistributor.merkleRoot());
        console.log('Merkle content hash: ' + await merkleDistributor.merkleContentHash());
        console.log('Last publish start block: ' + await merkleDistributor.lastPublishStartBlock());
        console.log('Last publish end block: ' + await merkleDistributor.lastPublishEndBlock());
        console.log('Last publish timestamp: ' + await merkleDistributor.lastPublishTimestamp());
        console.log('Last publish block number: ' + await merkleDistributor.lastPublishBlockNumber());
    }
}
