const { assert, expect } = require('chai');
const { deployments, ethers, getNamedAccounts } = require('hardhat');
const { developmentChains } = require('../../helper-hardhat-config');

// Execute with:
// $ yarn hardhat test

!developmentChains.includes(network.name)
    ? describe.skip // only execute the tests if we are on a development chain (localhost/hardhat)
    : describe('FundMe', async function () {
          let fundMe;
          let deployer;
          let mockV3Aggregator; // for storing the mock V3 aggregator
          const sendValue = ethers.parseEther('1'); // '1000000000000000000'; // 1 ETH
          beforeEach(async () => {
              // deploy fundMe contract using hardhat-deploy

              // select which account is going to connect to the contract
              // const accounts = await ethers.getSigners(); // returns "accounts" section of the specific network on the hardhat configuration file
              // deployer = accounts[0];
              deployer = (await getNamedAccounts()).deployer; // assign the output to deployer variable

              await deployments.fixture(['all']); // allows to run the "deploy" folder with any tags (we are passing "all" tag)
              fundMe = await ethers.getContractAt('FundMe', deployer); // get the most recent deployment of the specified contract
              mockV3Aggregator = await ethers.getContractAt(
                  'MockV3Aggregator',
                  deployer,
              );
          });

          describe('constructor', async function () {
              it('sets the aggregator addresses correctly', async function () {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, mockV3Aggregator.target);
              });
          });

          describe('fund', async function () {
              it('Fails if you dont send enough ETH', async function () {
                  await expect(fundMe.fund()).to.be.reverted;
              });

              it('Updated the amount funded data structure', async function () {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getAddressToAmountFunded(
                      // getAddressToAmountFunded = mapping of each address to the amout funded (data structure)
                      deployer,
                  );
                  assert.equal(response.toString(), sendValue.toString());
              });

              it('Adds funder to array of getFunder', async function () {
                  await fundMe.fund({ value: sendValue });
                  const funder = await fundMe.getFunder(0);
                  assert.equal(funder, deployer);
              });
          });

          describe('withdraw', async function () {
              // before withdraw the money we want to fund
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue });
              });

              it('Withdraw ETH from a single founder', async function () {
                  // contract and deployer balance AFTER the fund (remaining of the deployer and how much money he fund)
                  // const startingFundMeBalance = await ethers.provider.getBalance(fundMe.address,);
                  // const startingDeployerBalance = await ethers.provider.getBalance(deployer,);
                  // or ...
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // deployer withdraw the balance
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt; // we can check the name of the variables by using the debugger (Javascript debug terminal) and run "yarn hardhat test" with a breakpoint after the transactionReceipt is assigned
                  const gasCost = gasUsed * effectiveGasPrice; // we spent gas on the withdraw so we need to calculate the gasCost for the tests

                  // contract and deployer balance after the withdraw
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  );
                  const endingDeployerMeBalance =
                      await ethers.provider.getBalance(deployer);

                  // check if the contract has no more balance (we withdraw all), and check that the starting deployer balance + starting contract balance = ending deployer balance + gas of the withdraw transaction
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingDeployerMeBalance.add(gasCost).toString(),
                  );
              });

              it('Allows us to withdraw with multiple getFunder', async function () {
                  const accounts = await ethers.getSigners();
                  // i=0 is the deployer
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i],
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // deployer withdraw the balance
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt; // we can check the name of the variables by using the debugger (Javascript debug terminal) and run "yarn hardhat test" with a breakpoint after the transactionReceipt is assigned
                  const gasCost = gasUsed.mul(effectiveGasPrice); // we spent gas on the withdraw so we need to calculate the gasCost for the tests

                  // contract and deployer balance after the withdraw
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  );
                  const endingDeployerMeBalance =
                      await ethers.provider.getBalance(deployer);

                  // check if the contract has no more balance (we withdraw all), and check that the starting deployer balance + starting contract balance = ending deployer balance + gas of the withdraw transaction
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingDeployerMeBalance.add(gasCost).toString(),
                  );

                  // make sure the getFunder are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address,
                          ),
                          0,
                      );
                  }
              });

              it('Only allows the owner to withdraw', async function () {
                  // only the owner/deployer of the contract should be able to withdraw the funds
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker,
                  );
                  await expect(
                      attackerConnectedContract.withdraw(),
                  ).to.be.revertedWith('FundMe__NotOwner');
              });

              it('Cheaper withdraw testing...', async function () {
                  const accounts = await ethers.getSigners();
                  // i=0 is the deployer
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i],
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // deployer withdraw the balance
                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt; // we can check the name of the variables by using the debugger (Javascript debug terminal) and run "yarn hardhat test" with a breakpoint after the transactionReceipt is assigned
                  const gasCost = gasUsed.mul(effectiveGasPrice); // we spent gas on the withdraw so we need to calculate the gasCost for the tests

                  // contract and deployer balance after the withdraw
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  );
                  const endingDeployerMeBalance =
                      await ethers.provider.getBalance(deployer);

                  // check if the contract has no more balance (we withdraw all), and check that the starting deployer balance + starting contract balance = ending deployer balance + gas of the withdraw transaction
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingDeployerMeBalance.add(gasCost).toString(),
                  );

                  // make sure the getFunder are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address,
                          ),
                          0,
                      );
                  }
              });
          });
      });
