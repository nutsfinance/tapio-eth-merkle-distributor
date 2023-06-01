import {ethers} from "hardhat";
import { CONFIG } from '../config';

async function main() {
    const network = await ethers.provider.getNetwork();
    const config = CONFIG[network.name];

    const ERC20 = await ethers.getContractFactory("ERC20");
    const tapETH = ERC20.attach(config.tapeth);
    console.log('tapETH Balance before: ' + await tapETH.balanceOf(config.merkleDistributor));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });