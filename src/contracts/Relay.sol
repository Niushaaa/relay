pragma solidity 0.7.6;

import "./MerklePatriciaProof.sol";
import "./RLPReader.sol";

contract Relay {

    using RLPReader for RLPReader.RLPItem;
    using RLPReader for RLPReader.Iterator;
    using RLPReader for bytes;
    
    address public owner = msg.sender;
    
    uint public k;
    uint public lastHeight;

    modifier restricted() {
        require(
            msg.sender == owner,
            "This function is restricted to the contract's owner"
    );
    _;
    }

    struct blockHeader{
        bytes32 parentHash;
        bytes32 stateRoot;
        bytes32 txRoot;
        bytes32 receiptRoot;
        bytes32 difficulty;
        uint height;
        bytes32 nonce;
        bytes32 selfHash;
        uint parentIdx; // parent index in the chain
        bool finalized; // finalized is True, if the block header is finalized in the received chain
    }

    mapping (uint => mapping (uint => blockHeader)) public chain;
    mapping (uint => bytes32) public show;

    // constructor (uint256 genesisBlock) public {
    constructor () public {
        k = 6; // finality parameter
        lastHeight = 0;
    }
    
    function parseBlockHeader(bytes memory rawHeader, uint parentIdx) public{
        //first we enter this function
        blockHeader memory header;
        RLPReader.Iterator memory item = rawHeader.toRlpItem().iterator();
        
        uint idx;
        
        while (item.hasNext()) {
            if (idx == 0) {
                header.parentHash = bytes32(item.next().toUint());
                show[idx] = header.parentHash;
            } else if (idx == 3) {
                header.stateRoot = bytes32(item.next().toUint());
                show[idx] = header.stateRoot;
            } else if (idx == 4) {
                header.txRoot = bytes32(item.next().toUint());
                show[idx] = header.txRoot;
            } else if (idx == 5) {
                header.receiptRoot = bytes32(item.next().toUint());
                show[idx] = header.receiptRoot;
            } else if (idx == 7) {
                header.difficulty = bytes32(item.next().toUint());
                show[idx] = header.difficulty;
            } else if (idx == 8) {
                header.height = bytes32(item.next().toUint());
                show[idx] = header.height;
            } else if (idx == 14) {
                header.nonce = bytes32(item.next().toUint());
                show[idx] = header.nonce;
            } else if (idx == 13) {
                header.selfHash = bytes32(item.next().toUint());
                show[idx] = header.selfHash;
            }
            else{
                item.next();
            }
            idx++;
        }
        
        uint validParentIdx = validateBlockHeader(header, parentIdx);
        header.parentIdx = validParentIdx;
        addToChain(header);
        sendReward(msg.sender);
    }
    
    function validateBlockHeader(blockHeader header, uint parentIdx) internal returns(bool) {
        require(header.height >= lastHeight - k);
        parentIdx = parentExists(header, parentIdx);
        require(PoWisDone(header), 'Wrong PoW');
        return parentIdx;
    }
    
    function addToChain(blockHeader header) internal {
        if(header.height <= lastHeight){
            chain[header.height].append(header); //TODO: check if append works correctly
        }else{
            chain[header.height][0] = header;
            lastHeight++;
            pruneChain();
        }
    }

    function PoWisDone(blockHeader header) internal returns(bool) {
        
        return isDone;
    }
    function parentExists(blockHeader header, uint parentIdx) internal returns(uint) {
        require(chain[header.height-1][parentIdx].selfHash = header.parentHash, "parent doesn't exist");
        return parentIndex;
    }
    function pruneChain() internal {
        uint idx = k;
        uint currentHeight = lastHeight;
        uint stableIdx;
        while (idx) {
            stableIdx = chain[currentHeight].parentIdx;
            idx--;
            currentHeight--;
        }
        blockHeader stableHeader = chain[currentHeight][stableIdx];
        deleteHeight(currentHeight);
        chain[currentHeight][0] = stableHeader;
    }
    function deleteHeight(uint height) internal {
        uint idx = 0;
        while(chain[height][idx]){
            delete chain[height][idx]; //TODO: check if it works adn is set to 0 and 0 is considered false
            idx++;
        }
    }
    function sendReward(address) internal {
        // call ERC20 token contract to transfer reward tokens to the relayer
    }
    
    function checkTxProof(bytes value, uint blockHeight, bytes path, bytes parentNodes) public returns (bool) {
        // add fee for checking transaction
        require(blockHeight < lastHeight - k);
        bytes32 txRoot = chain[blockHeight].txRoot;
        // TxRootEvent(txRoot);
        return checkInclusionProof(value, path, parentNodes, txRoot);
    }

    function checkStateProof(bytes value, uint blockHeight, bytes path, bytes parentNodes) public returns (bool) {
        require(blockHeight < lastHeight - k);
        bytes32 stateRoot = chain[blockHeight].stateRoot;
        return checkInclusionProof(value, path, parentNodes, stateRoot);
    }

    function checkReceiptProof(bytes value, uint blockHeight, bytes path, bytes parentNodes) public returns (bool) {
        require(blockHeight < lastHeight - k);
        bytes32 receiptRoot = chain[blockHeight].receiptRoot;
        return checkInclusionProof(value, path, parentNodes, receiptRoot);
    }
  
    function checkInclusionProof(bytes value, bytes encodedPath, bytes parentNodes, bytes32 root) internal returns(bool) {
        return MerklePatriciaProof.verify(value, encodedPath, parentNodes, root);
    }
}