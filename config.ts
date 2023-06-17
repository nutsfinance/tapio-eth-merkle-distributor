export const CONFIG: any = {
    "goerli": {
        "version": "v2",
        "subql": "https://graphql.tapio.finance/goerli",
        "steth": {
            rewardCollectorForFee: "0x442C7D6425E2D02D7314165b1b04A01ef615EA53",
            rewardCollectorForYield: "0x8C96e4A7FFC6F62056Ea08a8B71F1AEaa1759554",
        },
        "reth": {
            rewardCollectorForFee: "0x14a10974122377E8e97030E53B67C1E3f971090a",
            rewardCollectorForYield: "0x3F9FBf4e4Ab136A57aF23880A183489AC3A98579",
        },
        "aggregator": "0xE4A195C75EF6397E78FdF45C62d474b2b2152B4F",
        "merkleDistributor": "0x1036b3204039A1F8F8F2bDAFA43c67825ac81d19",
        "tapeth": "0xA33a79c5Efadac7c07693c3ce32Acf9a1Fc5A387",
        "exclude_addresses": [
            // merkle distributor
            "0x1036b3204039A1F8F8F2bDAFA43c67825ac81d19",
            // steth fee reward
            "0x442C7D6425E2D02D7314165b1b04A01ef615EA53",
            // steth yield reward
            "0x8C96e4A7FFC6F62056Ea08a8B71F1AEaa1759554",
            // reth fee reward
            "0x14a10974122377E8e97030E53B67C1E3f971090a",
            // reth yield reward
            "0x3F9FBf4e4Ab136A57aF23880A183489AC3A98579"
        ]
    },
    "ethereum": {
        "subql": "",
        "steth": {},
        "reth": {},
        "tapeth": ""
    }
}
