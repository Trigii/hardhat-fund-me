# Hardhat Fund Me

This project contains a simple example of the deployment of a Blockchain Fund Me contract.

## Networks

- Hardhat / localhost
- Sepolia

## Usage

1. Create a ".env" file with the following format:
```sh
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/0g13gzE9srEm-bwM-Og8IQUI8Y_uWo1i
SEPOLIA_PRIVATE_KEY=5a2ban25j81jm8c61b45g108bd0fb845dd9745ee78a6b04648cb4a0930d406fc
ETHERSCAN_API_KEY=A4HMV89EFLMB9LZ6ASCDJ4XIHWDF9FCVPE
COINMARKETCAP_API_KEY=c786b228-3510-21ha-9mah-55237229a96k
```

2. Install the dependencies:
```sh
yarn
```

3. Compile the project:
```sh
yarn hardhat compile
```

4. Deploy the project:
```sh
MOCKS DEPLOYMENT (hardhat / localhost):
$ yarn hardhat deploy --tags mocks

SEPOLIA DEPLOYMENT (testnet):
yarn hardhat deploy --network sepolia
yarn hardhat deploy --network sepolia --tags fundme

Full deploy:
$ yarn hardhat deploy 
$ yarn hardhat deploy --tags all

LOCALHOST BLOCKCHAIN NODE:
$ yarn hardhat node
```

5. Deploy and test locally:
```sh
$ yarn hardhat node

Fund:
$ yarn hardhat run scripts/fund.js --network localhost

Withdraw:
$ yarn hardhat run scripts/withdraw.js --network localhost
```
