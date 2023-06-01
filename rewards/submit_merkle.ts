import { ethers } from "hardhat";
import { CONFIG } from "../config";
import { fileExists, getFile } from "./lib/aws_utils";
import * as dotenv from 'dotenv';
import { slice } from "lodash";
import { BigNumber } from "ethers";

dotenv.config();

export const submitMerkle = async (asset: string, block: number, automated: boolean) => {
    const network = await ethers.provider.getNetwork();
    const config = CONFIG[network.name][asset];
    const tapEthAddress = CONFIG[network.name]["tapeth"].address;

    const [deployer, distributor] = await ethers.getSigners();

    // Get the current cycle
    const merkleDistributorAbi = (await ethers.getContractFactory("MerkleDistributor")).interface;
    const merkleDistributor = new ethers.Contract(config.merkleDistributor, merkleDistributorAbi, deployer);
    const currentCycle = (await merkleDistributor.currentCycle()).toNumber();

    console.log(`Current cycle: ${currentCycle}`);

    const distributionFile = `distributions/${network.name}_${asset}_${block}.csv`;
    const newMerkleFile = `merkles/${network.name}_${asset}_${currentCycle + 1}.json`;
    const newMerkleTree = await getFile(newMerkleFile);
    const oldMerkleFile = `merkles/${network.name}_${asset}_${currentCycle}.json`;
    const oldMerkleTree = (await fileExists(oldMerkleFile)) ? await getFile(oldMerkleFile) : {};

    const oldMerkleTotal = oldMerkleTree.tokenTotals || {};
    const newMerkleTotal = newMerkleTree.tokenTotals;
    const feeTokens = [];
    const feeAmounts = [];
    const yieldTokens = [];
    const yieldAmounts = [];
    let feeAmount = BigNumber.from(0);
    let yieldAmount = BigNumber.from(0);

    // calculate fee and yield tokens and amounts
    const distributionList = (await getFile(distributionFile)).trim().split("\n").slice(1); // Skip header
    for (const distribution of distributionList) {
        const values = distribution.split(",");
        feeAmount = feeAmount.add(BigNumber.from(values[1].toString()));
        yieldAmount = yieldAmount.add(BigNumber.from(values[2].toString()));
    }

    for (const key in newMerkleTotal) {
        let oldValue = BigNumber.from(oldMerkleTotal[key] || "0");
        let value = newMerkleTotal[key];
        let diff = BigNumber.from(value).sub(oldValue);
        if (diff.gt(BigNumber.from('0'))) {
            if (feeAmount.add(yieldAmount).eq(diff)) {
                feeTokens.push(tapEthAddress);
                feeAmounts.push(feeAmount.toString());
                yieldTokens.push(tapEthAddress);
                yieldAmounts.push(yieldAmount.toString());
            } else {
                throw new Error(`Invalid fee/yield amount: ${diff.toString()}, ${feeAmount.toString()}, ${yieldAmount.toString()}`);
            }
            console.log(key, diff.toString());
        }
    }
    console.log(`feeTokens: ${feeTokens}, feeAmounts: ${feeAmounts}, yieldTokens: ${yieldTokens}, otherAmounts: ${yieldAmounts}`);
    console.log(`Reward collector address for fee: ${config.rewardCollectorForFee}`);
    if (config.rewardCollectorForYield) {
        console.log(`Reward collector address for yield: ${config.rewardCollectorForYield}`);
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

            const rewardCollectorForYield = new ethers.Contract(config.rewardCollectorForYield,
                rewardCollectorAggregatorAbi, distributor);
            const role3 = await rewardCollectorForFee.DISTRIBUTOR_ROLE();
            console.log('Proposal role3: ' + role3)
            console.log('Has role3: ' + await rewardCollectorForYield.hasRole(role3, roleAddress));

            const tx2 = await aggregator.distribute(config.merkleDistributor, config.rewardCollectorForFee, 
                config.rewardCollectorForYield,
                feeTokens, feeAmounts, yieldTokens, yieldAmounts);
            await tx2.wait();
            console.log("all rewards distributed");
        } else {
            console.log(`Reward collector address for fee/yield: ${config.rewardCollectorForFee}`);
            const rewardCollectorAbi = (await ethers.getContractFactory("RewardCollector")).interface;
            const rewardCollectorForFee = new ethers.Contract(config.rewardCollectorForFee, rewardCollectorAbi, distributor);
            const roleAddress = distributor.address;
            const role1 = await rewardCollectorForFee.DISTRIBUTOR_ROLE();
            console.log('Proposal role1: ' + role1)
            console.log('Has role1: ' + await rewardCollectorForFee.hasRole(role1, roleAddress));

            const rewardCollectorForYield = new ethers.Contract(config.rewardCollectorForYield, rewardCollectorAbi, distributor);
            const role2 = await rewardCollectorForFee.DISTRIBUTOR_ROLE();
            console.log('Proposal role2: ' + role2)
            console.log('Has role2: ' + await rewardCollectorForYield.hasRole(role2, roleAddress));

            const tx2 = await rewardCollectorForFee.distribute(config.merkleDistributor, feeTokens, feeAmounts);
            await tx2.wait();

            const tx3 = await rewardCollectorForYield.distribute(config.merkleDistributor, yieldTokens, yieldAmounts);
            await tx3.wait();
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
