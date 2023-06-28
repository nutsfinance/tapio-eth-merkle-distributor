import { ethers } from "hardhat";
import { distribute } from "./distribute";
import { generateMerkle } from "./generate_merkle";
import { sendToSlack } from "./lib/slack_utils";
import { getTapEthBalance } from "./query_balance_tapeth";
import { submitMerkle } from "./submit_merkle";

const main = async () => {
    let content = `Tapio Eth merkle distributor date time: ${new Date().toUTCString()}\n`;
    try {
        const blockNumber = await ethers.provider.getBlockNumber();
        console.log('Current block number: ' + blockNumber)
        content += `Current block number: ${blockNumber}\n`;
        // Round down to nearest 200 blocks
        const block = Math.floor(blockNumber / 200) * 200;
        console.log(`Pipeline runs at block ${block}`);
        content += `Pipeline runs at block ${block}\n`;

        // Asset-specific
        await getTapEthBalance(block);
        await distribute("steth", block);
        await distribute("reth", block);

        // Common
        await generateMerkle(["steth", "reth"], block);
        const tmp = await submitMerkle(["steth", "reth"], block, true);

        content += tmp;
        await sendToSlack(true, content);
    } catch (error) {
        content += `The job executed: Failed\n`;
        content += `Error: ${error}\n`;

        await sendToSlack(false, content);
    }
}

main().then(() => {
    process.exit(0);
}).catch(error => {
    console.error(error);
    process.exit(1);
})