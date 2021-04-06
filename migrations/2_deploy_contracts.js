var Web3 = require('web3');
require('dotenv').config({path:"../relayer.env"})
const relay = artifacts.require('Relay.sol');
var fs = require('fs')

module.exports = async(deployer, network, accounts) => {

  web3_source = new Web3(new Web3.providers.HttpProvider(process.env.SOURCE_HTTPS));
  block = await web3_source.eth.getBlock('latest')
  let deployRelay = await deployer.deploy(relay, block.hash, block.number);

  targetHttps = "TARGET_HTTPS=" + process.env.TARGET_HTTPS + "\n";
  targetWss = "TARGET_WSS=" + process.env.TARGET_WSS + "\n";
  sourceHttps = "SOURCE_HTTPS=" + process.env.SOURCE_HTTPS + "\n";
  sourceWss = "SOURCE_WSS=" + process.env.SOURCE_WSS + "\n";
  privateKey = "PRIVATE_KEY=" + process.env.PRIVATE_KEY + "\n";
  mnemonic = "MNEMONIC=" + process.env.MNEMONIC + "\n";
  relayAbi = "RELAY_ABI=" + process.env.RELAY_ABI + "\n";
  relayAddress = "RELAY_ADDRESS=" + deployRelay.address + "\n";

  fs.unlink('relayer.env', function (err) {
    if (err) throw err;
    console.log('File deleted!');
  });
  fs.open('relayer.env', 'w', function (err, file) {
    if (err) throw err;
    console.log('Saved!');
  });

  addVarToFile(targetHttps)
  addVarToFile(targetWss)
  addVarToFile(sourceHttps)
  addVarToFile(sourceWss)
  addVarToFile(privateKey)
  addVarToFile(mnemonic)
  addVarToFile(relayAbi)
  addVarToFile(relayAddress)
}

function addVarToFile(str){
  fs.appendFile('relayer.env', str, function (err) {
    if (err) throw err;
    console.log('Updated!');
  });
}