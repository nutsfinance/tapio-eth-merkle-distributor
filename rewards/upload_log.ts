import { createFile } from './lib/aws_utils';
import * as fs from 'fs';
import { ethers } from 'hardhat';

const main = async () => {
    const network = await ethers.provider.getNetwork();
    const stdout = process.env.LOG_FILE as string;
    const stdoutContent = fs.readFileSync(stdout).toString();
    await createFile(`logs/${network.name}_${stdout}`, stdoutContent);

    const stderr = process.env.ERROR_LOG_FILE as string;
    const stderrContent = fs.readFileSync(stderr).toString();
    await createFile(`logs/${network.name}_${stderr}`, stderrContent);
}

main().then(() => {
    process.exit(0);
}).catch(error => {
    console.error(error);
    process.exit(1);
})
