![Marketplace 2](https://user-images.githubusercontent.com/3207620/158163606-b405f462-785b-4bc1-8ac3-99fdfb010fc7.PNG)
![Marketplace 1](https://user-images.githubusercontent.com/3207620/158163601-53a64a3c-77e5-4bf9-8828-e465a8e60376.PNG)

# NFT-Marketplace (Hardhat-Solidity-React)
This app was coded by following a tutorial from Dapp University and was developed for educational purposes.

This app lets you connect your MetaMask wallet and create & list NFTs on an Ethereum-based blockchain. You can purchase NFTs and list them. Gas fees apply.

## Technology Stack
The smart contracts were developed using solidity and following [OpenZeppelin ERC721](https://docs.openzeppelin.com/contracts/2.x/api/token/erc721).

The front-end part was developed using React.js.

The front-end communicates with the blockchain using ethers and Web3.

The tests were written supported by Waffle Hardhat and using chai assertion library.

## Dependencies
Install the dependencies with:
```
npm install
npm install react-router-dom@6
npm install ipfs-http-client@56.0.1
npm i @openzeppelin/contracts@4.5.0
```

## Run the app
```
npm run start
```

## Deploy smart contracts
```
npx hardhat run src/backend/scripts/deploy.js --network localhost
```

## Run tests
```
npx hardhat test
```

## Connect MetaMask
Into metamask, click on the top network tab, scroll down and click custom RPC. The RPC url in our case is http://localhost:8545 and the chain ID is 31337.

## What I learned / improved
- Writing smart contracts in Solidity for NFTs following ERC721
- Writing complexe tests for smart contracts in js
- Setting up a blockchain with Hardhat
- Using ethers and Web3 to link the web app to the smart contracts and use MetaMask
- Creating a complexe React app interacting with the blockchain
- Blockchain developement in general

## What to improve
- Support different NFT collections
