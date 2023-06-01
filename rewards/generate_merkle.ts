/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import { ethers } from 'hardhat';
import { RewardList } from './lib/reward-list';
import { CONFIG } from '../config';
import { createFile, fileExists, getFile, publishMessage } from './lib/aws_utils';


async function updateRewardList(rewardList: RewardList, file: string) {
    // Add new distribution
    const distributionList = (await getFile(file)).trim().split("\n");
    const headers = distributionList[0].split(",");
    for (const distribution of distributionList) {
        // Skip header
        if (distribution.includes("Address")) continue;

        const values = distribution.split(",");
        if (!values[0])  continue;
        for (let i = 1; i < headers.length; i++) {
            // values[0] is the address
            // If this is a reserve
            if (headers[i].startsWith("reserve-")) {
                rewardList.updateUserReserve(values[0], headers[i].replace("reserve-", ""), values[i]);
            } else {
                rewardList.increaseUserRewards(values[0], headers[i], values[i]);
            }
        }
    }
}

export const generateMerkle = async (assets: string[], block: number) => {
    const network = await ethers.provider.getNetwork();
    console.log('\n------------------------------------------');
    console.log(`*        Generate Merkle Tree on ${network.name} *`);
    console.log('------------------------------------------\n');

    // Get the current cycle
    const config = CONFIG[network.name];
    const merkleDistributorAbi = (await ethers.getContractFactory("MerkleDistributor")).interface;

    const merkleDistributor = new ethers.Contract(config.merkleDistributor, merkleDistributorAbi, ethers.provider);
    const currentCycle = (await merkleDistributor.currentCycle()).toNumber();
    const currentEndBlock = (await merkleDistributor.lastPublishEndBlock()).toNumber();
    console.log(`Current cycle: ${currentCycle}, current end block: ${currentEndBlock}`);
    if (block < currentEndBlock) {
        console.log(`Block behind current end block. Skip distribution.`);
        return;
    }

    const oldMerkleFile = `merkles/${network.name}_${currentCycle}.json`;
    const newMerkleFile = `merkles/${network.name}_${currentCycle + 1}.json`;
    const rewardList = new RewardList(currentCycle + 1, currentEndBlock, block);

    // Load the current merkle
    if (await fileExists(oldMerkleFile)) {
        const currentMerkleTree = await getFile(oldMerkleFile);
        for (const user in currentMerkleTree.claims) {
            const tokens = currentMerkleTree.claims[user].tokens;
            const cumulativeAmounts = currentMerkleTree.claims[user].cumulativeAmounts;
            const reserveAmounts = currentMerkleTree.claims[user].reserveAmounts;

            for (let i = 0; i < tokens.length; i++) {
                if (reserveAmounts) {
                    rewardList.updateUserReserve(user, tokens[i], reserveAmounts[i]);
                }
                rewardList.increaseUserRewards(user, tokens[i], cumulativeAmounts[i]);
            }
        }
    }

    await Promise.all(
        assets.map(async (asset) => {
            const file = `distributions/${network.name}_${asset}_${block}.csv`
            await updateRewardList(rewardList, file);
        })
    );

    const newMerkleTree = rewardList.toMerkleTree();
    console.log('Merkle root: ' + newMerkleTree.merkleRoot);
    
    await createFile(newMerkleFile, JSON.stringify(newMerkleTree));

    const message = `New cycle: ${newMerkleTree.cycle}\n`
        + `New root: ${newMerkleTree.merkleRoot}\n`
        + `Start block: ${newMerkleTree.startBlock}\n`
        + `End block: ${newMerkleTree.endBlock}\n`;

    await publishMessage(message);
}