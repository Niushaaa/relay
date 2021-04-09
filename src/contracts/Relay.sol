pragma solidity 0.7.6;

import "./MerklePatriciaProof.sol";
import "./RLPReader.sol";
// import "./ethash.sol";

contract Relay {

    using RLPReader for RLPReader.RLPItem;
    using RLPReader for RLPReader.Iterator;
    using RLPReader for bytes;
    // Ethash public myEthash;
    
    address public owner = msg.sender;
    
    uint public k;
    uint public lastHeight;
    uint public initialHeight;
    
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
        bytes difficulty;
        uint height;
        uint nonce;
        bytes32 selfHash;
        bytes32 hashWithoutNonce;
        uint parentIdx; // parent index in the chain
    }

    mapping (uint => blockHeader[]) public chain;

    // constructor (Ethash _myEthash, bytes32 _selfHash, uint _height) public {
    constructor (bytes32 _selfHash, uint _height) public {
        // myEthash = _myEthash;
        k = 6; // finality parameter
        lastHeight = _height;
        initialHeight = _height;
        blockHeader memory firstBlockHeader;
        firstBlockHeader.selfHash = _selfHash;
        firstBlockHeader.height = _height;
        chain[_height].push(firstBlockHeader);
    }
    
    bytes public temp;
    uint256 public uintTemp;

    function parseBlockHeader(bytes memory rawHeader, bytes32 _selfHash, uint parentIdx, 
    uint[] calldata dataSetLookup, uint[] calldata witnessForLookup) public{
        //first we enter this function
        blockHeader memory header;
        RLPReader.Iterator memory item = rawHeader.toRlpItem().iterator();
        
        
        uint idx;
        
        while (item.hasNext()) {
            if (idx == 0) {
                header.parentHash = bytes32(item.next().toUint());
            } else if (idx == 3) {
                header.stateRoot = bytes32(item.next().toUint());
            } else if (idx == 4) {
                header.txRoot = bytes32(item.next().toUint());
            } else if (idx == 5) {
                header.receiptRoot = bytes32(item.next().toUint());
            } else if (idx == 7) {
                // TODO: small changes required (wrong bytes)
                header.difficulty = item.next().toRlpBytes();
                temp = header.difficulty;
                uintTemp = toUint256(temp);
            } else if (idx == 8) {
                header.height = item.next().toUint();
            } else if (idx == 14) {
                header.nonce = item.next().toUint();
            } else{
                item.next();
            }
            idx++;
        }
        
        header.selfHash = _selfHash;
        
        validateBlockHeader(header, parentIdx, dataSetLookup, witnessForLookup);
        header.parentIdx = parentIdx;
        header.hashWithoutNonce = getRlpHeaderHashWithoutNonce(rawHeader);
        addToChain(header);
        // sendReward(msg.sender);
    }
    
    function toUint256(bytes memory _bytes)   
      internal
      pure
      returns (uint256 value) {
    
        assembly {
          value := mload(add(_bytes, 0x20))
        }
    }
    
    function validateBlockHeader(blockHeader memory header, uint parentIdx, 
    uint[] calldata dataSetLookup, uint[] calldata witnessForLookup) internal {
        require(header.height >= lastHeight - k, "The block is old");
        require(header.height > initialHeight, "The block is super old");
        parentExists(header, parentIdx);
        require(PoWisDone(header, dataSetLookup, witnessForLookup), 'Wrong PoW');
    }
    
    function addToChain(blockHeader memory header) internal {
        chain[header.height].push(header);
        
        if((header.height) > lastHeight){
            lastHeight++;
            pruneChain();
        }
    }

    function PoWisDone(blockHeader memory header, uint[] calldata dataSetLookup, uint[] calldata witnessForLookup) internal returns(bool) {

        //dataSetLookup contains elements of the DAG needed for the PoW verification
        //witnessForLookup needed for verifying the dataSetLookup

        //(uint, bytes32, uint, difficulty, uint[] calldata, uint[] calldata) returns (uint, uint);
        
        // uint returnCode;
        // uint errorInfo;
        // (returnCode, errorInfo) = myEthash.verifyPoW(header.height, header.hashWithoutNonce, header.nonce, header.difficulty, dataSetLookup, witnessForLookup);
        
        
        // if (returnCode == 0){
        //     return true;
        // }
        // return false;
        return true;
    }

    function getRlpHeaderHashWithoutNonce(bytes memory rawHeader) private pure returns (bytes32){
        // duplicate rlp header and truncate nonce and mixDataHash
        bytes memory rlpWithoutNonce = copy(rawHeader, rawHeader.length-42);  // 42: length of none+mixHash
        uint16 rlpHeaderWithoutNonceLength = uint16(rawHeader.length-3-42);  // rlpHeaderLength - 3 prefix bytes (0xf9 + length) - length of nonce and mixHash
        bytes2 headerLengthBytes = bytes2(rlpHeaderWithoutNonceLength);
        rlpWithoutNonce[1] = headerLengthBytes[0];
        rlpWithoutNonce[2] = headerLengthBytes[1];

        return keccak256(rlpWithoutNonce);       
    }
    
    function copy(bytes memory sourceArray, uint newLength) private pure returns (bytes memory) {
        uint newArraySize = newLength;

        if (newArraySize > sourceArray.length) {
            newArraySize = sourceArray.length;
        }

        bytes memory newArray = new bytes(newArraySize);

        for(uint i = 0; i < newArraySize; i++){
            newArray[i] = sourceArray[i];
        }

        return newArray;
    }
    
    function parentExists(blockHeader memory header, uint parentIdx) internal {
        require(chain[header.height-1][parentIdx].selfHash == header.parentHash, "parent doesn't exist");
    }

    function pruneChain() internal {
        if ((lastHeight - initialHeight) >= k){
            uint idx = k;
            uint currentHeight = lastHeight;
            uint stableIdx = 0;
            while (idx > 0) {
                stableIdx = chain[currentHeight][stableIdx].parentIdx;
                idx--;
                currentHeight--;
            }
            chain[currentHeight][0] = chain[currentHeight][stableIdx];
            // blockHeader memory stableHeader = chain[currentHeight][stableIdx];
            if(chain[currentHeight].length > 1){
                deleteHeight(currentHeight);
            }
        }
    }

    function deleteHeight(uint height) internal {
        uint idx = 1;
        while(idx < chain[height].length){
            delete chain[height][idx];
            idx++;
        }
        // delete chain[height];
    }
    
    function sendReward(address relayerAddress) internal {

        // call ERC20 token contract to transfer reward tokens to the relayer
    }
    
    function checkTxProof(bytes memory value, uint blockHeight, bytes memory encodedPath, bytes memory rlpParentNodes) public returns (bool) {
        // add fee for checking transaction
        require(blockHeight < lastHeight - k, "Block is not finilized yet"); // require the block to be finilized 
        bytes32 txRoot = chain[blockHeight][0].txRoot;
        // TxRootEvent(txRoot);
        return checkInclusionProof(value, encodedPath, rlpParentNodes, txRoot);
    }

    function checkStateProof(bytes memory value, uint blockHeight, bytes memory encodedPath, bytes memory rlpParentNodes) public returns (bool) {
        require(blockHeight < lastHeight - k, "Block is not finilized yet"); // require the block to be finilized 
        bytes32 stateRoot = chain[blockHeight][0].stateRoot;
        return checkInclusionProof(value, encodedPath, rlpParentNodes, stateRoot);
    }

    function checkReceiptProof(bytes memory value, uint blockHeight, bytes memory encodedPath, bytes memory rlpParentNodes) public returns (bool) {
        require(blockHeight < lastHeight - k, "Block is not finilized yet"); // require the block to be finilized 
        bytes32 receiptRoot = chain[blockHeight][0].receiptRoot;
        return checkInclusionProof(value, encodedPath, rlpParentNodes, receiptRoot);
    }
  
    function checkInclusionProof(bytes memory value, bytes memory encodedPath, bytes memory rlpParentNodes, bytes32 root) internal returns(bool) {
         uint result;
         result = MerklePatriciaProof.verify(value, encodedPath, rlpParentNodes, root);
         if (result == 0){
             return true;
         }
         return false;
    }

    function getParentIdxNum(uint height) public returns (uint){
        return chain[height - 1].length;
    }

    function paresTransactionAmount (bytes memory rawData) public returns(uint256){
        bytes memory transactionData = parseRLP(rawData);
        return parseAmount(transactionData);
    }
    
    function parseRLP(bytes memory rlpData) internal returns(bytes memory){
        //first we enter this function
        RLPReader.Iterator memory item = rlpData.toRlpItem().iterator();
        uint idx;
        idx = 0;
        
        while (item.hasNext()) {
            test[idx] = item.next().toBytes();
            testKeck[idx] = keccak256(test[idx]);
            idx++;
        }
        
        return test[5];
    }
    
    function parseAmount(bytes memory data) internal returns(uint256) {
        uint256 parsedValue;
        assembly {
    	    parsedValue := mload(add(data, 68))
        }
        return parsedValue;
    }
}
