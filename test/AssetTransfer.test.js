const MyAssetTransfer = artifacts.require("AssetTransfer");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
require('chai')
.use(require('chai-as-promised'))
.should();
contract("MyAssetTransfer",(accounts)=>{
    let myAssetTransfer;
    const initialTokens = '5';
    const deployer = accounts[0];
    const relay = accounts[1];
    const testAccountLock = accounts[2];
    const testAccountUnlock = accounts[3];
    const testAccountMint = accounts[4];
    const testAccountBurn = accounts[5];
    const transferAmount = '2';
    const lockAmount = '1';
    let transferReceipt;
    before(async () => {
        myAssetTransfer = await MyAssetTransfer.new(relay, initialTokens, {from: deployer});
    });

    describe('Locking', async()=>{
        it('The locking account must have some balance before locking.',async() =>{
            await truffleAssert.fails(
                myAssetTransfer.lock(lockAmount, {from: testAccountLock}),
                truffleAssert.ErrorType.REVERT
            );
        });
        it('The locking amount should be positive.',async() =>{
            await truffleAssert.fails(
                myAssetTransfer.lock('0', {from: testAccountLock}),
                truffleAssert.ErrorType.REVERT
            );
        });
        it('The locking account must not have locked assets before locking for the first time.',async() =>{
            let hasLocked = await myAssetTransfer.getHasLocked(testAccountLock, {from: testAccountLock});
            assert.equal(false, hasLocked);
        });
        it("The locking account's balance must not be less than the locking amount.",async() =>{
            await myAssetTransfer.freeMint({from: testAccountLock});
            let accountBalance = await myAssetTransfer.getBalance(testAccountLock, {from: testAccountLock});
            await truffleAssert.fails(
                myAssetTransfer.lock(accountBalance+1, {from: testAccountLock}),
                truffleAssert.ErrorType.REVERT
            );
        });
        it('The locking should be successful if everything is ok.',async() =>{
            await myAssetTransfer.lock(lockAmount, {from: testAccountLock});
            let hasLocked = await myAssetTransfer.getHasLocked(testAccountLock, {from: testAccountLock});
            let lockedValue = await myAssetTransfer.getHasLocked(testAccountLock, {from: testAccountLock});
            assert.equal(true, hasLocked);
            assert.equal(lockAmount, lockedValue);
            ////////////////////// Have not unlocked here. Use another account for the
            ////////////////////// rest of the tests.
        });
        it('The balance of the locking account should decrease in accordance to the locking amount.',async() =>{
            let balanceBefore = await myAssetTransfer.getBalance(testAccountLock, {from: testAccountLock});
            await myAssetTransfer.lock(lockAmount, {from: testAccountLock});
            let balanceAfter = await myAssetTransfer.getBalance(testAccountLock, {from: testAccountLock});
            assert.equal(balanceBefore - balanceAfter, lockAmount);
        });
    });
    describe('Unlocking', async()=>{
        it('The unlocking amount must be positive.',async() =>{
            await truffleAssert.fails(
                myAssetTransfer.unlock(web3.utils.asciiToHex(''), '0', {from: testAccountUnlock}),
                truffleAssert.ErrorType.REVERT
            );
        });
        it('The unlocking account must have some locked assets before unlocking.',async() =>{
            await truffleAssert.fails(
                myAssetTransfer.unlock(web3.utils.asciiToHex(''), lockAmount, {from: testAccountUnlock}),
                truffleAssert.ErrorType.REVERT
            );
        });
        it('The unlocking amount must not be greater than the locked amount.',async() =>{
            await myAssetTransfer.freeMint({from: testAccountUnlock});
            await myAssetTransfer.lock(lockAmount, {from: testAccountUnlock});
            await truffleAssert.fails(
                myAssetTransfer.unlock(web3.utils.asciiToHex(''), lockAmount+1, {from: testAccountUnlock}),
                truffleAssert.ErrorType.REVERT
            );
        });
        it('The unlocking account should be categorized as non-locked after unlocking all of the locked amount.',async() =>{
            ///////////////////////////////////////////////
            ///////////////////////////////////////////////
            ///////////////////////////////////////////////
            ///////////////////////////////////////////////
            await myAssetTransfer.unlock(web3.utils.asciiToHex(''), lockAmount, {from: testAccountUnlock});
            let hasLocked = await myAssetTransfer.getHasLocked(testAccountUnlock, {from:testAccountUnlock});
            assert.equal(false, hasLocked);
        });
        it('The balance of the unlocking account should increase in accordance to the unlocking amount.',async() =>{
            ///////////////////////////////////////////////
            ///////////////////////////////////////////////
            ///////////////////////////////////////////////
            ///////////////////////////////////////////////
            await myAssetTransfer.lock(lockAmount, {from: testAccountUnlock});
            let balanceBefore = await myAssetTransfer.getBalance(testAccountUnlock, {from: testAccountUnlock});
            await myAssetTransfer.unlock(web3.utils.asciiToHex(''), lockAmount, {from: testAccountUnlock});
            let balanceAfter = await myAssetTransfer.getBalance(testAccountUnlock, {from: testAccountUnlock});
            assert.equal(balanceAfter - balanceBefore, lockAmount);
        });
    });
    describe('Minting', async()=>{
        it('The burning amount must be positive.',async() =>{
            await truffleAssert.fails(
                myAssetTransfer.mint(web3.utils.asciiToHex(''), '0', {from: testAccountMint}),
                truffleAssert.ErrorType.REVERT
            );
        });
        it('The burning account must have minted assets before burning.',async() =>{
            let hasMinted = await myAssetTransfer.getHasMinted(testAccountMint, {from: testAccountMint});
            assert.equal(false, hasMinted);
        });
        it('The burning account must not have minted assets before minting for the first time.',async() =>{
            let hasMinted = await myAssetTransfer.getHasMinted(testAccountMint, {from: testAccountMint});
            assert.equal(false, hasMinted);
        });

    });
    describe('Burning', async()=>{
        it('The burning amount must be positive.',async() =>{
            await truffleAssert.fails(
                myAssetTransfer.burn('0', {from: testAccountBurn}),
                truffleAssert.ErrorType.REVERT
            );
        });
        it('The burning account must have some minted assets before burning.',async() =>{
            await truffleAssert.fails(
                myAssetTransfer.burn(lockAmount, {from: testAccountBurn}),
                truffleAssert.ErrorType.REVERT
            );
        });
        it("The burning amount must not be greater then the account's balance.",async() =>{
            let accountBalance = await myAssetTransfer.getBalance(testAccountBurn, {from: testAccountBurn});
            await truffleAssert.fails(
                myAssetTransfer.burn(accountBalance+1, {from: testAccountBurn}),
                truffleAssert.ErrorType.REVERT
            );
        });

    });
});