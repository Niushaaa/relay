var Web3 = require('web3');
const EthereumBlock = require('ethereumjs-block/from-rpc');
const rlp = require('rlp');

web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/v3/6eca357aaabe473bbbaee64211ab3a14'));

async function start() {
    _block = await web3.eth.getBlock('latest')
    var block = new EthereumBlock(_block)
    console.log('0x' + rlp.encode(block.header.raw).toString('hex'))
    console.log(_block)
    console.log(block)
}

start();