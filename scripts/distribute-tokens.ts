import { ethers } from "hardhat";

const COLLECTOR = '0x05fC4e64B4242ef130F14Da7DFBCd0fD0266bFe7';


async function main() {
    const RewardCollector = await ethers.getContractFactory("RewardCollector");
    const collector = RewardCollector.attach(COLLECTOR);

    const roleAddress = '0x99537d82F6F4AAD1419dD14952B512c7959A2904';
    const role1 = await collector.DISTRIBUTOR_ROLE();
    console.log('Proposal role: ' + role1)
    console.log('Has role: ' + await collector.hasRole(role1, roleAddress));
    const tx2 = await collector.distribute("0xf595F4a81B27E5CC1Daca349A69c834f375224F4", ["0x0000000000000000000300000000000000000000"], ["55084335606093"]);
    await tx2.wait();
    const tx3 = await collector.distribute("0xff066331be693BE721994CF19905b2DC7475C5c9", ["0x0000000000000000000300000000000000000001"], ["84410855656476"]);
    await tx3.wait();
    console.log("distributed");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });
