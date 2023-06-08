export const CONFIG: any = {
    "goerli": {
        "subql": "https://graphql.tapio.finance/goerli",
        "steth": {
            rewardCollectorForFee: "0x78d21ca1e393fEADF4Fda3D90558A601f9411bc5",
            rewardCollectorForYield: "0x7C3dB44C6D0fFcF5bB0C2FD9c8F5906256C91f3c",
        },
        "reth": {
            rewardCollectorForFee: "0xc2C7E949efAA399BaF7fa0dc7faf20fFFAd9d7B2",
            rewardCollectorForYield: "0x66cD8317b78a0Cd94CfAc74F108BcF67f31Af89f",
        },
        "aggregator": "0x790af6f96C37bd67876b8a05e86d4598b6FeF9b8",
        "merkleDistributor": "0x4226D6e76C50dB5074b0E3512b21F1a79eA9F360",
        "tapeth": "0xDFfB1823e24A76e5682e988DF9C4bF53bf3299De",
        "exclude_addresses": [
            // merkle distributor
            "0x4226D6e76C50dB5074b0E3512b21F1a79eA9F360",
            // steth fee reward
            "0x78d21ca1e393fEADF4Fda3D90558A601f9411bc5",
            // steth yield reward
            "0x7C3dB44C6D0fFcF5bB0C2FD9c8F5906256C91f3c",
            // reth fee reward
            "0xc2C7E949efAA399BaF7fa0dc7faf20fFFAd9d7B2",
            // reth yield reward
            "0x66cD8317b78a0Cd94CfAc74F108BcF67f31Af89f"
        ]
    },
    "ethereum": {
        "subql": "",
        "steth": {},
        "reth": {},
        "tapeth": ""
    }
}
