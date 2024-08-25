const { getNamedAccounts, ethers, network } = require('hardhat');
const { developmentChains } = require('../../helper-hardhat-config');
const { assert } = require('chai');

// Execute with:
// $ yarn hardhat test --network sepolia

developmentChains.includes(network.name)
    ? describe.skip // only execute the tests if we are not on a development chain (localhost/hardhat)
    : describe('FundMe', async function () {
          let fundMe;
          let deployer;
          const sendValue = ethers.parseEther('1');

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              fundMe = await ethers.getContractAt('FundMe', deployer);
              // we dont deploy the contract because we asume that is already deployed
              // we dont need the mock because staging tests are deployed on a testnet
          });

          it('allows people to fund and withdraw', async function () {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw();
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address,
              );
              assert.equal(endingBalance.toString(), '0');
          });
      });
