/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import { ethers } from 'hardhat';
import { BN } from 'bn.js'
import { createFile, fileExists, getFile, publishMessage } from './lib/aws_utils';
import { CONFIG } from '../config';

export const distributeTapEth = async (block: number) => {
    const network = await ethers.provider.getNetwork();

    console.log('\n------------------------------------------');
    console.log(`*      Distribute tapETH Rewards on ${network.name} *`);
    console.log('------------------------------------------\n');

    const balanceFile = `balances/${network.name}_tapeth_${block}.csv`;
    const distributionFile = `distributions/${network.name}_tapeth_${block}.csv`;
    const statsFile = `stats/${network.name}_tapeth.json`;
    if (await fileExists(distributionFile)) {
        console.log(`${distributionFile} exists. Skip distribution.`);
        return;
    }

    const balances = (await getFile(balanceFile)).trim().split("\n").slice(1); // first line is header
    let balanceTotal = new BN(0);
    let accountBalance: {[address: string]: any} = {};
    for (const balanceLine of balances) {
        const [address, balance] = balanceLine.split(",");
        if (!accountBalance[address]) {
            accountBalance[address] = new BN(0);
        }
        accountBalance[address] = accountBalance[address].add(new BN(balance));

        balanceTotal = balanceTotal.add(new BN(balance));
    }

    const config = CONFIG[network.name]["tapeth"];
    const merkleDistributorAbi = (await ethers.getContractFactory("MerkleDistributor")).interface;

    const merkleDistributor = new ethers.Contract(config.merkleDistributor, merkleDistributorAbi, ethers.provider);
    const currentCycle = (await merkleDistributor.currentCycle()).toNumber();
    const currentEndBlock = (await merkleDistributor.lastPublishEndBlock()).toNumber();
    console.log(`Current cycle: ${currentCycle}, current end block: ${currentEndBlock}`);
    if (block < currentEndBlock) {
        console.log(`Block behind current end block. Skip distribution.`);
        return;
    }

    const erc20Abi = (await ethers.getContractFactory("ERC20")).interface;
    const tapETH = new ethers.Contract(config.erc20, erc20Abi, ethers.provider);
    const feeBalance = await tapETH.balanceOf(config.feeAddress);
    const feeBalanceBN = new BN(feeBalance.toString());

    console.log(`Fee balance: ${feeBalance.toString()}, balanceTotal: ${balanceTotal.toString()}`);

    let content = `Address,${config.feeAddress}\n`;
    for (const address in accountBalance) {
        const tapETHRewards = accountBalance[address].mul(feeBalanceBN).div(balanceTotal);
        content += `${address},${tapETHRewards.toString()}\n`;
    }
    await createFile(distributionFile, content);

    // Notify the fee and yield amount with SNS
    const message = `tapETH amount: ${feeBalance.toString()}\n`;
    await publishMessage(message);

    // TODO Transfer tapETH to merkle distributor from fee and yield recipients

    // Save to stats
    let stats: any = { cycles: {} };
    if (await fileExists(statsFile)) {
        stats = await getFile(statsFile);
    }
    console.log(`stats: ${currentCycle + 1}`);
    stats.cycles[currentCycle + 1] = {
        startBlock: currentEndBlock,
        endBlock: block,
        balances: {
            tapeth: balanceTotal.toString(),
        },
        rewards: {
            tapeth: feeBalance.toString()
        }
    };
    await createFile(statsFile, JSON.stringify(stats));
}
