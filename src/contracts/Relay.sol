pragma solidity 0.7.6;

// import "./MerklePatriciaProof.sol";
import "./RLPReader.sol";

contract Relay {

    using RLPReader for RLPReader.RLPItem;
    using RLPReader for RLPReader.Iterator;
    using RLPReader for bytes;
    
    address public owner = msg.sender;


    modifier restricted() {
        require(
            msg.sender == owner,
            "This function is restricted to the contract's owner"
    );
    _;
    }

    struct blockHeader{
        uint parentHash;
        bytes32 stateRoot;
        bytes32 txRoot;
        bytes32 receiptRoot;
        bool finalized; // finalized is True, if the block header is finalized in the received chain
    }

    mapping (uint256 => mapping (uint256 => blockHeader)) public chain;
    mapping (uint => uint) public show;

    // constructor (uint256 genesisBlock) public {
    constructor () public {
    }
    
    function parseBlockHeader(bytes memory rawHeader) public{
        //first we enter this function
        blockHeader memory header;
        RLPReader.Iterator memory item = rawHeader.toRlpItem().iterator();
        
        uint idx;
        
        while (item.hasNext()) {
            if (idx == 0) {
                header.parentHash = item.next().toUint();
            } else if (idx == 3) {
                header.stateRoot = bytes32(item.next().toUint());
            } else if (idx == 4) {
                header.txRoot = bytes32(item.next().toUint());
            } else if (idx == 5) {
                header.receiptRoot = bytes32(item.next().toUint());
            } else if (idx == 8) {
                header.difficulty = item.next().toUint();
            else if (idx == 9) {
                number = item.next().toUint();
            }    
            } else if (idx == 15) {
                header.nonce = item.next().toUint();
            }
            else{
                item.next();
            }
            idx++;
        }
        //check nonce with difficulty
    }
    
    // function submitBlockHeader(blockHeader) internal returns(bool){
    //     return submitted;
    // }
    // function validateBlockHeader(blockHeader) internal returns(bool) {
    //     return isValid;
    // }

    // function parentExists(blockHeader) internal returns(uint256) {
    //     return parentIndex; //parent index in previous height of the target block header
    // }
    function pruneChain() internal {

    }
    function sendReward(address) internal {
        // call ERC20 token contract to transfer reward tokens to the relayer
    }
    // function checkInclusionProof(bytes value, bytes encodedPath, bytes parentNodes, bytes32 root) constant internal returns(bool) {
    //     return MerklePatriciaProof.verify(value, encodedPath, parentNodes, root);
    // }
}
