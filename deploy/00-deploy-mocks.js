// this will deploy first and it will check if we are deploying the contract on the localhost. If its the case, it will

const { network } = require('hardhat');
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require('../helper-hardhat-config');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments; // pull 2 functions from deployments
    const { deployer } = await getNamedAccounts(); // get accounts from the "accounts" section of each network on the hardhat config file (we have to create )

    if (developmentChains.includes(network.name)) {
        log('Local network detected! Deploying mocks...');
        await deploy('MockV3Aggregator', {
            contract: 'MockV3Aggregator',
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER], // arguments of the constructor of the contract (check https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/tests/MockV3Aggregator.sol); decimals and intialAnswer
        });
        log('Mocks deployed!');
        log('--------------------------------');
    }
};

module.exports.tags = ['all', 'mocks']; // these tags will tell hardhat-deploy to execute this script if the user specified one of them with the flag "--tags TAG"
