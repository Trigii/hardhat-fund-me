/*
Option 1:
function deployFunc(hre) {
    console.log('Hi!');
    hre.getNamedAccounts()
    hre.deployments
}

module.exports.default = deployFunc; // export function so other scripts can work with it
*/

const { network } = require('hardhat');
const {
    networkConfig,
    developmentChains,
} = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');
// this is equal to:
// const helperConfig = require('../helper-hardhat-config');
// const networkConfig = helperConfig.networkConfig
// that is why we export the function

//module.exports = async (hre) => {
// => -> error function
//     const { getNamedAccounts, deployments } = hre; // pull variables from hre
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments; // pull 2 functions from deployments
    const { deployer } = await getNamedAccounts(); // get accounts from the "accounts" section of each network on the hardhat config file (we have to create )
    const chainId = network.config.chainId;

    // const ethUsdPriceFeedAddress = networkConfig[chainId]['ethUsdPriceFeed']; // extract the price feed of ETH/USD based on the network we are deploying the contract

    let ethUsdPriceFeedAddress; // variable that contains the price feed address (depends if we are deploying on a main/testnet or localhost/hardhat)
    if (developmentChains.includes(network.name)) {
        // localhost / hardhat case (if the contract doesent exist, we deploy a minimal version for our local testing (mock contracts -> 00-deploy-mocks))
        const ethUsdAggregator = await deployments.get('MockV3Aggregator'); // get the deployment
        ethUsdPriceFeedAddress = ethUsdAggregator.address; // get the mock price feed address
    } else {
        // main / testnet case
        ethUsdPriceFeedAddress = networkConfig[chainId]['ethUsdPriceFeed'];
    }

    // if we deploy on localhost or hardhat newtork we are going to use mock (for the PriceConverter priceFeed ETH ID)
    const fundMe = await deploy('FundMe', {
        from: deployer, // who deploys this (private address)
        args: [ethUsdPriceFeedAddress], // list of arguments of the constructor of the contract (price feed address)
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // ---------------------- VERIFY THE DEPLOYMENT OF THE CONTRACT ----------------------
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        // we normally want to wait for block confirmations to give etherscan a chance to index our transaction
        // we dont need to wait for block confirmations in here (we can do it on the hardhat configuration file and contract deployment)
        await verify(fundMe.address, [ethUsdPriceFeedAddress]);
    }

    log('--------------------------------');
};

module.exports.tags = ['all', 'fundme']; // these tags will tell hardhat-deploy to execute this script if the user specified one of them with the flag "--tags TAG"

// 10:52:52
