pragma solidity 0.7.6;

// this interface should also have a built-in token system. We can use ERC20.
interface AssetTransferInterface {
    function lock(uint amount) external;
    // The unlock function should be able to talk with the relay smart contract on
    // its own blockchain, in order to verify the presented proof of burn by the client.
    function unlock(bytes32 proof, uint amount) external;
    function burn(uint amount) external;
    // The mint function should be able to talk with the relay smart contract on
    // its own blockchain, in order to verify the presented proof of lock by the client.
    function mint(bytes32 proof, uint amount) external;
}