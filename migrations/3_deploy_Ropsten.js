var Web3 = require('web3');
require('dotenv').config({path:"../.env"})
const relay = artifacts.require('Relay.sol');
const assetTransfer = artifacts.require('AssetTransfer.sol')
var fs = require('fs')

module.exports = async(deployer, network, accounts) => {

  web3_source = new Web3(new Web3.providers.HttpProvider(process.env.TARGET_HTTPS));
  block = await web3_source.eth.getBlock('latest')
  let deployRelay = await deployer.deploy(relay, block.hash, block.number);

  let deployAssetTransfer = await deployer.deploy(assetTransfer, deployRelay.address, process.env.INITIAL_TOKEN)

  initialToken = "INITIAL_TOKEN=" + process.env.INITIAL_TOKEN + "\n"
  targetHttps = "TARGET_HTTPS=" + process.env.TARGET_HTTPS + "\n";
  targetWss = "TARGET_WSS=" + process.env.TARGET_WSS + "\n";
  sourceHttps = "REACT_APP_SOURCE_HTTPS=" + process.env.REACT_APP_SOURCE_HTTPS + "\n";
  sourceWss = "SOURCE_WSS=" + process.env.SOURCE_WSS + "\n";
  privateKey = "PRIVATE_KEY=" + process.env.PRIVATE_KEY + "\n";
  mnemonic = "MNEMONIC=" + process.env.MNEMONIC + "\n";
  relayAbi = "RELAY_ABI=" + process.env.RELAY_ABI + "\n";
  relayAddress = "RELAY_ADDRESS=" + process.env.RELAY_ADDRESS + "\n";
  KovanAsset = "REACT_APP_KOVAN_ASSET=" + process.env.REACT_APP_KOVAN_ASSET + "\n";
  RopstenAsset = "REACT_APP_ROPSTEN_ASSET=" + deployAssetTransfer.address + "\n"

  fs.unlink('.env', function (err) {
    if (err) throw err;
    console.log('File deleted!');
  });
  fs.open('.env', 'w', function (err, file) {
    if (err) throw err;
    console.log('Saved!');
  });

  addVarToFile(initialToken)
  addVarToFile(targetHttps)
  addVarToFile(targetWss)
  addVarToFile(sourceHttps)
  addVarToFile(sourceWss)
  addVarToFile(privateKey)
  addVarToFile(mnemonic)
  addVarToFile(relayAbi)
  addVarToFile(relayAddress)
  addVarToFile(KovanAsset)
  addVarToFile(RopstenAsset)
}

function addVarToFile(str){
  fs.appendFile('.env', str, function (err) {
    if (err) throw err;
    console.log('Updated!');
  });
}