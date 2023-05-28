import { ethers } from "hardhat";

import { distributeTapEth } from "./distribute_tapeth";
import { generateMerkle } from "./generate_merkle";
import { getTapEthBalance } from "./query_balance_tapeth";
import { submitMerkle } from "./submit_merkle";

const main = async () => {
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log('Current block number: ' + blockNumber)
    // Round down to nearest 200 blocks
    const block = Math.floor(blockNumber / 200) * 200;
    console.log(`tapETH pipeline runs at block ${block}`);

    // Asset-specific
    await getTapEthBalance(block);
    await distributeTapEth(block);

    // Common
    await generateMerkle("tapeth", block);
    await submitMerkle("tapeth", true);
}

main().then(() => {
    process.exit(0);
}).catch(error => {
    console.error(error);
    process.exit(1);
})