var Web3 = require('web3');
require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider');
const EthereumBlock = require('ethereumjs-block/from-rpc');
const rlp = require('rlp');

web3_source = new Web3(new Web3.providers.HttpProvider(relayer.env.SOURCE_HTTPS));
// web3_target = new Web3(new Web3.providers.HttpProvider(relayer.env.TARGET_HTTPS));
targetWallet = new HDWalletProvider(relayer.env.MNEMONIC, relayer.env.TARGET_WSS);

var blockHeader{
    parentHash: undefined,
    stateRoot: undefined,
    txRoot: undefined,
    receiptRoot: undefined,
    difficulty: undefined,
    height: undefined,
    nonce: undefined,
    selfHash: undefined,
    hashWithoutNonce: undefined,
    parentIdx: undefined // parent index in the chain
}

function start() {
    _block = getBlockHeader();
    var block = new EthereumBlock(_block)
    getRlpEncodedBlockHeader(block)
    
    const relay = new targetWallet.eth.Contract(relay.env.RELAY_ABI, relay.env.RELAY_ADDRESS);
    relay.methods.getParentArray(_block.height).call();
}

async function getBlockHeader(){
    block = await web3_source.eth.getBlock()
    return block
}

function getRlpEncodedBlockHeader(block){
    return '0x' + rlp.encode(block.header.raw).toString('hex')
}

start();