// Get funds from users
// Withdraw funds
// Set a minimum funding value in USD

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import './PriceConverter.sol';

error FundMe__NotOwner();

/**
 * @title A contract for crowd funding
 * @author Tristán Vaquero
 * @notice This contract is a demo of a sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 10 ** 18; // variables that wont change -> constant
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded; // s_ means its a storage variable (its going to consume a lot of GAS)
    address private immutable i_owner; // variables that we set one time outside of the same line that they are declared -> immutable
    AggregatorV3Interface private s_priceFeed; // global variable created and obtaining its value in the constructor so we dont have to hardcode the priceFeed and we can pass it dynamically.

    // modifiers: key words that we can add at the function declaration to modify the functions with a functionality.
    // When we call a function with a modifer, we are saying: before executing the function, execute the code in the modifer
    modifier onlyOwner() {
        // require(msg.sender == i_owner, NotOwner()); // we want that only the owner of the contract is able to withdraw money; the metamask address of the person deploying the contract must be the same to the metamask address of the person withdrawing money.
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _; // do the function code. We can put it above to do first the function and then the modifier.
    }

    // function that automatically is called when we deploy the contract -> like a normal constructor. Its called immediately after deploying the contract.
    constructor(address priceFeedAddress) {
        i_owner = msg.sender; // msg.sender = the person who is deploying the contract (address on metamask)
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // What happens if someone sends this contract ETH withput calling the fund function
    // The ETH sent to this contract will just go to the contract but we wouldnt have any track of those people
    // receive
    // fallback
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    // contract addresses can hold funds too since every time we deploy a contract we get an address similar to a wallet.
    // payable = be able to access the value attribute when deploying the App
    /**
     * @notice This function funds this contract
     * @dev This implements price feeds as our library
     */
    function fund() public payable {
        // We want to be able to set a minimum fund amount in USD (get the ETH price / 50 -> eth converter and put the 0.X in ETH -> copy the wei and put it on Value -> run fund
        // Send ETH to this contract:
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            'ERROR: Didnt send enough ETH!'
        ); // the minimum value is 1 ETH (1e18 == 1 * 10 ^ 18 == 1 ETH in WEI). "require" is an "if". If the condition is not met, all the actions from before will be undone.
        s_funders.push(msg.sender); // msg.sender = address sending (keeping track of the donators donating to our contract)
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    // withdraw funds out of this contract so they can buy things for this project
    function withdraw() public onlyOwner {
        // require(msg.sender == owner, "Sender is not the owner"); // we want that only the owner of the contract is able to withdraw money; to avoid using require all the time, we can create a modifier

        // reset funders because we are returning all the money from them
        for (
            uint256 fudnerIndex = 0;
            fudnerIndex < s_funders.length;
            fudnerIndex++
        ) {
            address funder = s_funders[fudnerIndex]; // get the funder
            s_addressToAmountFunded[funder] = 0; // reset funds
        }

        // reset array of funders
        s_funders = new address[](0); // reset array with 0 objects/elements to start with

        // withdraw funds
        // 3 ways:

        // 1. transfer (if fails, throws an error and automatically reverts the transaction)
        // msg.sender = type address; payable(msg.sender) = payable address -> to be able to send the tokens
        // payable(msg.sender).transfer(address(this).balance); // payable(msg.sender) -> gets the address where we are going to send the money; address(this).balance -> amount we are going to transfer (this = contract)

        // 2. send (doesent throw an error or revert the transaction. Returns a boolean if the transfer was successfull or not)
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed"); // check the transaction to revert it if it fails

        // 3. call (recommended way. Allows to call any function)
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }(''); // address(this) = contract ; .balance = balance of the contract
        require(callSuccess, 'Send failed');
    }

    // withdraw function but more GAS efficient
    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders; // we read once the funders array and store it in memory so we dont have to constantly read and waste GAS (mappings cannot be stored in memory)
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}('');
        require(success, 'Send failed');
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getVersion() public view returns (uint256) {
        return s_priceFeed.version();
    }
}
