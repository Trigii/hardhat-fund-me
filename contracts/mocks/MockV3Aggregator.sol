// here we define our mock price feed aggregator
// create our own fake price feed contract so we can test all locally
// we already have some on the internet that we can import them.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol'; // reference: https://github.com/smartcontractkit/chainlink/tree/develop/contracts/src/v0.8/tests
