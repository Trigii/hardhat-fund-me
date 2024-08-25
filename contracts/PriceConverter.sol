// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import {AggregatorV3Interface} from '@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol'; // import directly from GitHub the interface

library PriceConverter {
    // function to convert msg.value to the USD equivalent
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        // ABI of the contract we want to interact with
        // Address of the contract we want to interact with: 0x694AA1769357215DE4FAC081bf1f309aDC325306 (https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1)
        // AggregatorV3Interface give us the minimalistic ABI to interact with a contract
        (, int price, , , ) = priceFeed.latestRoundData(); // price = price of ETH in terms of USD (8 decimals -> 3000.00000000 -> We need 18 decimals to match msg.value); if the function returns more than one value and we are not going to use it, we can leave them blank
        return uint256(price * 10000000000);
    }

    // 1000000000
    // call it get fiatConversionRate, since it assumes something about decimals
    // It wouldn't work for every aggregator
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1000000000000000000; // it has 18 zeros so we have to devide
        // the actual ETH/USD conversation rate, after adjusting the extra 0s.
        return ethAmountInUsd;
    }
}
