# Cross-chain Asset Transfer

This project provides a DApp designed to provide experimental cross-chain asset transfet between two Ethereum-based blockchains. The main blockchains used in this DApp are the Ropsten and Kovan Ethereum testnets. The asset of interest is a dummy asset introduced in the system, in order to enable a proof-of-concept demonstration of our system.

## How to run?

First you have to migrate the contracts to the blockchains. The two networks are specified in the truffle-config.js file, and you can start the deployment using the following command:
### `truffle migrate --network kovan --network ropsten`
After the deployment is finished, you can launch the system using the following command:
### `./run`
Finally, you can launch the DApp using:
### `npm start`

