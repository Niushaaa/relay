var Web3 = require('web3');
require('dotenv').config({path:"/home/niusha/Desktop/Relay/relay/.env"})
const Tx = require('ethereumjs-tx').Transaction;
const HDWalletProvider = require('@truffle/hdwallet-provider');
const EthereumBlock = require('ethereumjs-block/from-rpc');
const rlp = require('rlp');
const privateKey = Buffer.from(process.env.PRIVATE_KEY,'hex',)

web3_source = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_SOURCE_HTTPS));
// web3_target = new Web3(new Web3.providers.HttpProvider(process.env.TARGET_HTTPS));
targetWallet = new HDWalletProvider(process.env.MNEMONIC, process.env.TARGET_WSS);
web3_target = new Web3(targetWallet)

const RELAY_ABI = [ { "inputs": [ { "internalType": "bytes32", "name": "_selfHash", "type": "bytes32" }, { "internalType": "uint256", "name": "_height", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "chain", "outputs": [ { "internalType": "bytes32", "name": "parentHash", "type": "bytes32" }, { "internalType": "bytes32", "name": "stateRoot", "type": "bytes32" }, { "internalType": "bytes32", "name": "txRoot", "type": "bytes32" }, { "internalType": "bytes32", "name": "receiptRoot", "type": "bytes32" }, { "internalType": "bytes", "name": "difficulty", "type": "bytes" }, { "internalType": "uint256", "name": "height", "type": "uint256" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "bytes32", "name": "selfHash", "type": "bytes32" }, { "internalType": "bytes32", "name": "hashWithoutNonce", "type": "bytes32" }, { "internalType": "uint256", "name": "parentIdx", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "initialHeight", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "k", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastHeight", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "temp", "outputs": [ { "internalType": "bytes", "name": "", "type": "bytes" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "uintTemp", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "bytes", "name": "rawHeader", "type": "bytes" }, { "internalType": "bytes32", "name": "_selfHash", "type": "bytes32" }, { "internalType": "uint256", "name": "parentIdx", "type": "uint256" }, { "internalType": "uint256[]", "name": "dataSetLookup", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "witnessForLookup", "type": "uint256[]" } ], "name": "parseBlockHeader", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes", "name": "value", "type": "bytes" }, { "internalType": "uint256", "name": "blockHeight", "type": "uint256" }, { "internalType": "bytes", "name": "encodedPath", "type": "bytes" }, { "internalType": "bytes", "name": "rlpParentNodes", "type": "bytes" } ], "name": "checkTxProof", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes", "name": "value", "type": "bytes" }, { "internalType": "uint256", "name": "blockHeight", "type": "uint256" }, { "internalType": "bytes", "name": "encodedPath", "type": "bytes" }, { "internalType": "bytes", "name": "rlpParentNodes", "type": "bytes" } ], "name": "checkStateProof", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes", "name": "value", "type": "bytes" }, { "internalType": "uint256", "name": "blockHeight", "type": "uint256" }, { "internalType": "bytes", "name": "encodedPath", "type": "bytes" }, { "internalType": "bytes", "name": "rlpParentNodes", "type": "bytes" } ], "name": "checkReceiptProof", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "height", "type": "uint256" } ], "name": "getParentIdxNum", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes", "name": "rawData", "type": "bytes" } ], "name": "parseTransactionAmount", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "function" } ];
const relay = new web3_target.eth.Contract(RELAY_ABI, process.env.RELAY_ADDRESS);

// TODO: handle when the connection of web3 is lost

async function start(blockNumber) {
	var flag = 0;
    var _block = await getBlockHeader(blockNumber);
    var block = new EthereumBlock(_block)
    var EncodedBlock = getRlpEncodedBlockHeader(block)
    
    const accounts = await web3_target.eth.getAccounts();
    var relayer = accounts[0];

	console.log('---------')
    console.log(blockNumber)

	// get the lengh of previous height blocks
	var parentLen = await getParentLen(_block);
	var blockNumber = _block.number;

	if(parentLen > 0){
		// get block infos of the previous height from the target blockchain
		// and find parentIdx
		var parentIdx = await getParentIdx(blockNumber, parentLen, _block);
		console.log("**parent idx**")
		console.log(parentIdx)
		if(parentIdx == -1){
			parentLen = 0
		}
	}

	while(parentLen == 0){
		var prevWasSuccessful = await start(blockNumber - 1);
		console.log("next block parsing started")
		if(prevWasSuccessful == false){
			return false
		}
		var parentLen = await getParentLen(_block);
		console.log("**parent len**")
		console.log(parentLen)

		if(parentLen > 0){
			// get block infos of the previous height from the target blockchain
			// and find parentIdx
			var parentIdx = await getParentIdx(blockNumber, parentLen, _block);
			console.log("**parent idx**")
			console.log(parentIdx)
			if(parentIdx == -1){
				parentLen = 0
			}
		}
	}

	// submit the block on the target blockchain
	var isSuccessful = await sendBlockHeader(EncodedBlock, _block, parentIdx, relayer);

	return isSuccessful
}

async function sendBlockHeader(EncodedBlock, _block, parentIdx, relayer){
	var isSuccessful = false;

	const myData = relay.methods.parseBlockHeader(EncodedBlock, _block.hash, parentIdx, [0], [0]).encodeABI();

	var txCount = await web3_target.eth.getTransactionCount(relayer)

	// Build the transaction
	const txObject = {
		nonce:    web3_target.utils.toHex(txCount),
		to:       process.env.RELAY_ADDRESS,
		value:    web3_target.utils.toHex(web3_target.utils.toWei('0', 'ether')),
		gasLimit: web3_target.utils.toHex(2100000),
		gasPrice: web3_target.utils.toHex(web3_target.utils.toWei('20', 'gwei')),
		data: myData  
	}
	// Sign the transaction
	const tx = new Tx(txObject, { chain: 'kovan'});
	tx.sign(privateKey);
		
	const serializedTx = tx.serialize();
	const raw = '0x' + serializedTx.toString('hex');
		
	// Broadcast the transaction
	const transaction = await web3_target.eth.sendSignedTransaction (raw, (err, txReceipt)  => {
		if(err){
			console.log("err = " + err)
		}
	});

	console.log("parsed block num")
	console.log(_block.number)
	console.log("________________________________")
	isSuccessful = true;

	// await relay.methods.parseBlockHeader(EncodedBlock, _block.hash, parentIdx, [0], [0]).send({from:relayer}, async function(error, result){
    //     if(!error){
	// 		isSuccessful = true;
    //     }
    // });
	
	return isSuccessful
}

async function getParentIdx(blockNumber, parentLen, block){
	var parentIdx = -1
	for(i = 0;i < parentLen;i++){
		var parent = await relay.methods.chain(blockNumber - 1, i).call();
		if(parent['selfHash'] == block.parentHash){
			parentIdx = i;
			break
		}
	}

	return parentIdx
}

async function getParentLen(block){
	var parentLen
	await relay.methods.getParentIdxNum(block.number.valueOf()).call(async function(error, result){
        if(!error){
			parentLen = result;
        }
    });
	return parentLen;
}

async function getBlockHeader(blockNumber){
	var block = await web3_source.eth.getBlock(blockNumber)
    // console.log(block)
    return block
}

function getRlpEncodedBlockHeader(block){
    return '0x' + rlp.encode(block.header.raw).toString('hex')
}

async function relayer(){
	while(true){
		await start('latest');
		console.log("relayer started parsing a new block")
	}
}

relayer();