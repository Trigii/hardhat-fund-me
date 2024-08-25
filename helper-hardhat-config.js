// file that uses a different configuration based on the network we are deploying the contract.
const networkConfig = {
    // sepolia network
    11155111: {
        // sepolia chainID = 11155111
        name: 'sepolia',
        ethUsdPriceFeed: '0x694AA1769357215DE4FAC081bf1f309aDC325306', // price feed address for ETH/USD on Sepolia
    },
};

const developmentChains = ['hardhat', 'localhost']; // definition of development chains to decide if we are deploying the mock contract of the real one
const DECIMALS = 8; // number of decimals (MockV3Aggregator contract argument)
const INITIAL_ANSWER = 200000000000; // 2000 + 8 decimals (MockV3Aggregator contract argument)

module.exports = {
    // export function so other scripts can work with it (they have to be imported with require)
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
};
