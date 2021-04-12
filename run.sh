#!/bin/bash

truffle migrate --f 3 --to 3 --network ropsten --reset
truffle migrate --f 2 --to 2 --network kovan --reset
sleep 1
node ./src/Relayer.js