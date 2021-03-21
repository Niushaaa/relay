pragma solidity 0.7.6;

// import "./MerklePatriciaProof.sol";
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
        bytes32 height;
        bytes32 nonce;
        bytes32 hash;
        uint parentIdx; // parent index in the chain
        bool finalized; // finalized is True, if the block header is finalized in the received chain
    }

    mapping (uint256 => mapping (uint256 => blockHeader)) public chain;
    mapping (uint => bytes32) public show;

    // constructor (uint256 genesisBlock) public {
    constructor () public {
        k = 6; // finality parameter
        lastHeight = 0;
    }
    
    function parseBlockHeader(bytes memory rawHeader) public{
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
            }else if (idx == 8) {
                header.height = bytes32(item.next().toUint());
                show[idx] = header.height;
            } else if (idx == 14) {
                header.nonce = bytes32(item.next().toUint());
                show[idx] = header.nonce;
            } else if (idx == 13) {
                header.hash = bytes32(item.next().toUint());
                show[idx] = header.hash;
            }
            else{
                item.next();
            }
            idx++;
        }
        
        uint parentIdx;
        parentIdx = validateBlockHeader(header);
        header.parentIdx = parentIdx;
        addToChain(header, parentIdx);
        if (header.height > lastHeight) {
            lastHeight = header.height;
            pruneChain();
        }
    }
    
    function validateBlockHeader(blockHeader) internal returns(bool) {
        require(blockHeader.height >= lastHeight - k);
        uint parentIdx;
        parentIdx = parentExists(blockHeader);
        require(parentIdx == -1, 'parent does not exist');
        require(PoWisDone(blockHeader), 'Wrong PoW');
        return parentIdx;
    }
    
    function addToChain(blockHeader) internal returns(bool) {
        //add the valid BH to the chain
        return true;
    }

    function PoWisDone(blockHeader) internal returns(bool) {
        return isDone;
    }
    function parentExists(blockHeader) internal returns(uint) {
        return parentIndex; //parent index in previous height of the target block header, not exist = -1
    }
    function pruneChain() internal {

    }
    function sendReward(address) internal {
        // call ERC20 token contract to transfer reward tokens to the relayer
    }
    // function checkInclusionProof(bytes value, bytes encodedPath, bytes parentNodes, bytes32 root) constant internal returns(bool) {
    //     return MerklePatriciaProof.verify(value, encodedPath, parentNodes, root);
    // }
}