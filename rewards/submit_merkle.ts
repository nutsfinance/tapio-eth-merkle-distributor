import { ethers } from "hardhat";
import { CONFIG } from "../config";
import { fileExists, getFile } from "./lib/aws_utils";
import * as dotenv from 'dotenv';
import { slice } from "lodash";
import { BigNumber } from "ethers";
import { formatAmount } from "./lib/log";

dotenv.config();

async function collectRewardWithAggregator(data: any) {
    console.log(`Reward collector aggregator address: ${data.aggregator}`);
    const rewardCollectorAggregatorAbi = (await ethers.getContractFactory("RewardCollectorAggregator")).interface;
    const aggregator = new ethers.Contract(data.aggregator, rewardCollectorAggregatorAbi, data.distributor);
    const roleAddress = data.distributor.address;
    const role1 = await aggregator.DISTRIBUTOR_ROLE();
    console.log(`Proposal aggregator role address: ${role1}`);
    console.log(`Distributor ${roleAddress} has role: ${await aggregator.hasRole(role1, roleAddress)}`);

    const rewardCollectorAbi = (await ethers.getContractFactory("RewardCollector")).interface;
    const rewardCollectorForFee = new ethers.Contract(data.rewardCollectorForFee, rewardCollectorAbi, data.distributor);
    const role2 = await rewardCollectorForFee.DISTRIBUTOR_ROLE();
    console.log(`Proposal rewardCollector for fee role address: ${role2}`)
    console.log(`Aggregator ${data.aggregator} has role: ${await rewardCollectorForFee.hasRole(role2, data.aggregator)}`);

    const rewardCollectorForYield = new ethers.Contract(data.rewardCollectorForYield,
        rewardCollectorAggregatorAbi, data.distributor);
    const role3 = await rewardCollectorForYield.DISTRIBUTOR_ROLE();
    console.log(`Proposal rewardCollector for yield role address: ${role3}}`);
    console.log(`Aggregator ${data.aggregator} has role: ${await rewardCollectorForYield.hasRole(role3, data.aggregator)}`);

    const tx = await aggregator.distribute(data.merkleDistributor, data.rewardCollectorForFee, 
        data.rewardCollectorForYield,
        data.feeTokens, data.feeAmounts, data.yieldTokens, data.yieldAmounts);
    await tx.wait();
    console.log("rewards distributed");
}

async function collectReward(data: any) {
    console.log(`Reward collector address for fee: ${data.rewardCollectorForFee}, yield: ${data.rewardCollectorForYield}`);
    const rewardCollectorAbi = (await ethers.getContractFactory("RewardCollector")).interface;
    const rewardCollectorForFee = new ethers.Contract(data.rewardCollectorForFee, rewardCollectorAbi, data.distributor);
    const roleAddress = data.distributor.address;
    const role1 = await rewardCollectorForFee.DISTRIBUTOR_ROLE();
    console.log(`Proposal rewardCollector for fee role: ${role1}`);
    console.log(`Distributor ${roleAddress} has role: ${await rewardCollectorForFee.hasRole(role1, roleAddress)}`);

    const rewardCollectorForYield = new ethers.Contract(data.rewardCollectorForYield, rewardCollectorAbi, data.distributor);
    const role2 = await rewardCollectorForYield.DISTRIBUTOR_ROLE();
    console.log(`Proposal rewardCollector for yield role: ${role2}`);
    console.log(`Distributor ${roleAddress} has role: ${await rewardCollectorForYield.hasRole(role2, roleAddress)}`);

    const tx1 = await rewardCollectorForFee.distribute(data.merkleDistributor, data.feeTokens, data.feeAmounts);
    await tx1.wait();

    const tx2 = await rewardCollectorForYield.distribute(data.merkleDistributor, data.yieldTokens, data.yieldAmounts);
    await tx2.wait();
    console.log("fee/yield distributed");
}

export const submitMerkle = async (assets: string[], block: number, automated: boolean) => {
    const network = await ethers.provider.getNetwork();
    const config = CONFIG[network.name];

    const [deployer] = await ethers.getSigners();

    // Get the current cycle
    const merkleDistributorAbi = (await ethers.getContractFactory("MerkleDistributor")).interface;
    const merkleDistributor = new ethers.Contract(config.merkleDistributor, merkleDistributorAbi, deployer);
    const currentCycle = (await merkleDistributor.currentCycle()).toNumber();

    console.log(`Current cycle: ${currentCycle}`);
    let content = `Current cycle: ${currentCycle}\n`;

    const newMerkleFile = `merkles/${network.name}_${config.version}_${currentCycle + 1}.json`;
    const newMerkleTree = await getFile(newMerkleFile);
    const oldMerkleFile = `merkles/${network.name}_${config.version}_${currentCycle}.json`;
    const oldMerkleTree = (await fileExists(oldMerkleFile)) ? await getFile(oldMerkleFile) : {};

    const oldMerkleTotal = oldMerkleTree.tokenTotals || {};
    const newMerkleTotal = newMerkleTree.tokenTotals;

    const detials = new Map<string, any>();
    assets.forEach((asset) => {
        detials.set(asset, {
            distributor: deployer,
            aggregator: config.aggregator,
            merkleDistributor: config.merkleDistributor,
            rewardCollectorForFee: config[asset].rewardCollectorForFee,
            rewardCollectorForYield: config[asset].rewardCollectorForYield,

            feeTokens: [],
            feeAmounts: [],
            yieldTokens: [],
            yieldAmounts: []
        });
    });

    let totalAmount = BigNumber.from(0);
    await Promise.all(
        Array.from(detials.entries()).map(async ([asset, data]) => {
            // calculate fee and yield tokens and amounts
        const distributionFile = `distributions/${network.name}_${asset}_${config.version}_${block}.csv`;
        const distributionList = (await getFile(distributionFile)).trim().split("\n");
        const headers = distributionList[0].split(",");

        let feeAmount = BigNumber.from(0);
        let yieldAmount = BigNumber.from(0);

        for (const distribution of distributionList) {
            // Skip header
            if (distribution.includes("Address")) continue;

            const values = distribution.split(",");
            const feeBN = BigNumber.from(values[1].toString());
            const yieldBN = BigNumber.from(values[2].toString());
            totalAmount = totalAmount.add(feeBN).add(yieldBN);
            feeAmount = feeAmount.add(feeBN);
            yieldAmount = yieldAmount.add(yieldBN);
        }

        data.feeTokens.push(headers[1]);
        data.feeAmounts.push(feeAmount);
        data.yieldTokens.push(headers[2]);
        data.yieldAmounts.push(yieldAmount);
    }));

    console.log(`TotalAmount: ${formatAmount(totalAmount)}, fee and yield details:`);
    console.log(detials);
    content += `TotalAmount: ${formatAmount(totalAmount)}\n`;
    content += `stETH fee: ${formatAmount(detials.get('steth').feeAmounts[0])}, yield: ${formatAmount(detials.get('steth').yieldAmounts[0])}\n`;
    content += `rETH fee: ${formatAmount(detials.get('reth').feeAmounts[0])}, yield: ${formatAmount(detials.get('reth').yieldAmounts[0])}\n`;

    for (const key in newMerkleTotal) {
        let oldValue = BigNumber.from(oldMerkleTotal[key] || "0");
        let value = newMerkleTotal[key];
        let diff = BigNumber.from(value).sub(oldValue);
        if (diff.gt(BigNumber.from(0))) {
            if (!totalAmount.eq(diff)) {
                throw new Error(`Invalid total amount: ${diff.toString()}, ${totalAmount.toString()}`);
            }
            console.log(key, diff.toString());
        }
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
            for (const [_asset, data] of Array.from(detials.entries())) {
                await collectRewardWithAggregator(data);
            }
        } else {
            for (const [_asset, data] of Array.from(detials.entries())) {
                await collectReward(data);
            }
        }

        const tx2 = await merkleDistributor.approveRoot(newMerkleTree.merkleRoot, ethers.utils.formatBytes32String(''), currentCycle + 1, newMerkleTree.startBlock, newMerkleTree.endBlock);
        await tx2.wait();

        console.log('Cycle after approval: ' + await merkleDistributor.currentCycle());
        console.log('Merkle root: ' + await merkleDistributor.merkleRoot());
        console.log('Merkle content hash: ' + await merkleDistributor.merkleContentHash());
        console.log('Last publish start block: ' + await merkleDistributor.lastPublishStartBlock());
        console.log('Last publish end block: ' + await merkleDistributor.lastPublishEndBlock());
        console.log('Last publish timestamp: ' + await merkleDistributor.lastPublishTimestamp());
        console.log('Last publish block number: ' + await merkleDistributor.lastPublishBlockNumber());
    }

    content += `New Cycle: ${await merkleDistributor.currentCycle()}\n`;
    content += `Merkle root: ${await merkleDistributor.merkleRoot()}\n`;
    content += `Merkle content hash: ${await merkleDistributor.merkleContentHash()}\n`;
    content += `Last publish start block: ${await merkleDistributor.lastPublishStartBlock()}\n`;
    content += `Last publish end block: ${await merkleDistributor.lastPublishEndBlock()}\n`;
    content += `Last publish timestamp: ${await merkleDistributor.lastPublishTimestamp()}\n`;
    content += `Last publish block number: ${await merkleDistributor.lastPublishBlockNumber()}\n`;

    return content;
}
