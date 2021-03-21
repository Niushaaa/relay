var Web3 = require('web3');
const EthereumBlock = require('ethereumjs-block/from-rpc');
const rlp = require('rlp');

web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

async function start() {
    _block = await web3.eth.getBlock()
    var block = new EthereumBlock(_block)
    console.log('0x' + rlp.encode(block.header.raw).toString('hex'))
    console.log(_block)
    console.log(block)
}

start();