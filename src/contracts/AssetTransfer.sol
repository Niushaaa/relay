pragma solidity 0.7.6;

import "./Relay.sol";
import "./AssetTransferInterface.sol";

contract AssetTransfer is AssetTransferInterface {
    uint256 initialTokens;
    Relay relay;
    uint decimals = 18;
    
    mapping(address => uint256) balances;
    mapping(address => uint256) locked;
    mapping(address => uint256) minted;
    mapping(address => bool) hasLocked;
    mapping(address => bool) hasMinted;

    constructor(Relay _relay, uint256 _initialTokens) {
        relay = _relay;
        initialTokens = _initialTokens;
    }

    event Lock(address indexed locker, uint256 amount);
    event Burn(address indexed burner, uint256 amount);
    event FreeMint(address indexed client);
    event ErrorMint();

    function lock(uint256 amount) external override {
        require(amount > 0, "The client should request a non-zero amount for locking.");
        require(amount <= balances[msg.sender], "The client cannot lock more assets than he/she has.");
        //First verify the client has that much ethers.
        locked[msg.sender] += amount;
        hasLocked[msg.sender] = true;
        balances[msg.sender] -= amount;
        emit Lock(msg.sender, amount);
    }

    function unlock(uint blockNumber, bytes memory rawTransaction, bytes memory encodedPath, bytes memory rlpParentNodes) external override {
        uint256 amount;
        amount = relay.parseTransactionAmount(rawTransaction);
        require(amount > 0, "The client should request a non-zero amount for unlocking.");
        require(hasLocked[msg.sender] == true, "The client cannot unlock non-locked assets.");
        require(locked[msg.sender] >= amount, "The client cannot unlock more than the locked amount.");
        require(relay.checkTxProof(rawTransaction, blockNumber, encodedPath, rlpParentNodes) == true, "The proof should be correct.");
        // It should first verify proof of burn.
        if (locked[msg.sender] == amount) {
            hasLocked[msg.sender] = false;
        }
        // The increment for balances[msg.sender] should be equal to the tx amount.
        balances[msg.sender] += locked[msg.sender];
        // The decrement for locked[msg.sender] should be equal to the tx amount.
        locked[msg.sender] -= amount;
    }

    function burn(uint256 amount) external override {
        require(amount > 0, "The client should request a non-zero amount for burning.");
        require(hasMinted[msg.sender] == true, "The client should have minted tokens before burning.");
        require(minted[msg.sender] >= amount, "The client cannot burn more than he/she has minted.");
        require(balances[msg.sender] >= amount, "The client cannot burn more than his/her balance.");
        if (minted[msg.sender] == amount) {
            hasMinted[msg.sender] = false;
        }
        minted[msg.sender] -= amount;
        balances[msg.sender] -= amount;
        emit Burn(msg.sender, amount);
    }

    function mint(uint blockNumber, bytes memory rawTransaction, bytes memory encodedPath, bytes memory rlpParentNodes) external override {
        uint256 amount;
        //relay.salam();
        amount = relay.parseTransactionAmount(rawTransaction);
        //amount = amount / (10 ** decimals);
        //require(amount > 0, "The client should request a non-zero amount for minting.");
        try relay.checkTxProof(rawTransaction, blockNumber, encodedPath, rlpParentNodes) returns (bool isCorrect) {
            //require(relay.checkTxProof(rawTransaction, blockNumber, encodedPath, rlpParentNodes) == true, "The proof should be correct.");
            if (isCorrect) {
            minted[msg.sender] = amount;
            hasMinted[msg.sender] = true;        
            balances[msg.sender] += amount;    
            }
        } catch (bytes memory) {
            emit ErrorMint();
        }
        //require(relay.checkTxProof(rawTransaction, blockNumber, encodedPath, rlpParentNodes) == true, "The proof should be correct.");
        // It should first verify the provided lock proof.
        //verify(proof);
        //minted[msg.sender] = amount;
        //hasMinted[msg.sender] = true;        
        //balances[msg.sender] += amount;

    }

    function _transfer(address sender, address receiver, uint256 amount) private {
        require(balances[sender] >= amount, "The sender should have enough assets to transfer.");
        balances[receiver] += amount;
        balances[sender] -= amount;
    }

    function freeMint() external {
        balances[msg.sender] = initialTokens;
        hasLocked[msg.sender] = false;
        locked[msg.sender] = 0;
        hasMinted[msg.sender] = false;
        minted[msg.sender] = 0;
        emit FreeMint(msg.sender);
    }

    function getBalance(address account) public view returns (uint256 balance) {
        return balances[account];
    }

    function getLocked(address account) public view returns (uint256 amount) {
        return locked[account];
    }

    function getMinted(address account) public view returns (uint256 amount) {
        return minted[account];
    }

    function getHasMinted(address account) public view returns (bool val) {
        return hasMinted[account];
    }

    function getHasLocked(address account) public view returns (bool val) {
        return hasLocked[account];
    }
    //function checkInclusion(bytes32 txhash) private view returns bool {

    //}
}