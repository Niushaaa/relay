const Relay = artifacts.require("Relay");
const truffleAssert = require('truffle-assertions');
require('chai')
.use(require('chai-as-promised'))
.should();
var BN = web3.utils.BN

contract("Relay",(accounts)=>{
    let myErc20;
    const firstBlockHash = 'My Token';
    const firstBlockHeight = 'ABC';
    const deployer = accounts[0];
    const relayer = accounts[1];
    const user = accounts[2];
    const transferAmount = '100';
    const doubleTransferAmount = '200';
    const burnAmount = '10';
    const allowanceChangeAmount = '20';
    const transferFromAmount = '50';
    before(async () =>{
        relay = await Relay.new(firstBlockHash, firstBlockHeight);
    });
    describe('Deployment', async()=>{
        it('The deployment should be done successfully',async() =>{
            const address = myErc20.address
            assert.notEqual(address,0x0)
            assert.notEqual(address,'')
            assert.notEqual(address,null)
            assert.notEqual(address,undefined) 
        });

        it('The deployed smart contract has the correct name', async()=>{
            const name = await myErc20.name();
            assert.equal(name, tokenName)
        });

        it('The deployed smart contract has the correct symbol', async()=>{
            const symbol = await myErc20.symbol();
            assert.equal(symbol, tokenSymbol);
        });

        it('The deployed smart contract has the correct total supply', async()=>{
            let totalSupply = await myErc20.totalSupply();
            assert.equal(totalSupply.toString(), web3.utils.toWei(new web3.utils.BN(tokenTotalSupply)).toString());
        });
    });

    describe('Transfer', async() =>{
        before(async () => {
            transferReceipt = await myErc20.transfer(owner, transferAmount, {from: deployer});
        });

        it('The recipient should have the amount of token been transferred.', async() =>{
            let tokenInAccount2 = await myErc20.balanceOf(owner);
            assert.equal(tokenInAccount2.toString(), transferAmount.toString());
        });

        it('Transfer more than balance fails.', async() => {
            await truffleAssert.fails(
                myErc20.transfer(deployer, doubleTransferAmount, {from: owner}),
                truffleAssert.ErrorType.REVERT
            );
        });
    });

    describe('Burn', async() =>{
        it('Account should reflect the burnt amount.', async() =>{
            let beforeBurnAmount = await myErc20.balanceOf(owner);
            burnReceipt = await myErc20.burn(burnAmount, {from: owner});
            let tokenInAccount2 = await myErc20.balanceOf(owner);
            assert.equal(tokenInAccount2.toString(), beforeBurnAmount.sub(new BN(burnAmount)).toString());
        });
    });

    describe('Approve', async() =>{
        it('Allowance should show the approval.', async() =>{
            let beforeApproval = await myErc20.allowance(owner, spender);
            approveReceipt = await myErc20.approve(spender, transferAmount, {from: owner});
            let afterApproval = await myErc20.allowance(owner, spender);
            assert.equal(beforeApproval.add(new BN(transferAmount)).toString(), afterApproval.toString());
        });
    });

    describe('Increase Allowance', async() =>{
        it('Increasment of allowance is done successfully.', async() =>{
            let beforeIncrease = await myErc20.allowance(owner, spender);
            increaseReceipt = await myErc20.increaseAllowance(spender, allowanceChangeAmount, {from: owner});
            let afterIncrease = await myErc20.allowance(owner, spender);
            assert.equal(beforeIncrease.add(new BN(allowanceChangeAmount)).toString(), afterIncrease.toString());
        });
    });

    describe('Decrease Allowance', async() =>{
        it('Decreasment of allowance is done successfully.', async() =>{
            let beforeDecrease = await myErc20.allowance(owner, spender);
            decreaseReceipt = await myErc20.decreaseAllowance(spender, allowanceChangeAmount, {from: owner});
            let afterDecrease = await myErc20.allowance(owner, spender);
            assert.equal(beforeDecrease.sub(new BN(allowanceChangeAmount)).toString(), afterDecrease.toString());
        });
    });

    describe('Transfer From', async() =>{
        it('Transfer from owner to deployer is done successfully.', async() =>{
            let beforeTransferFromAllowance = await myErc20.allowance(owner, spender);
            let beforeTransferFromOwner = await myErc20.balanceOf(owner);
            let beforeTransferFromDeployer = await myErc20.balanceOf(deployer);
            transferFromReceipt = await myErc20.transferFrom(owner, deployer, transferFromAmount, {from: spender});
            let afterTransferFromAllowance = await myErc20.allowance(owner, spender);
            let afterTransferFromOwner = await myErc20.balanceOf(owner);
            let afterTransferFromDeployer = await myErc20.balanceOf(deployer);
            console.log('       Allowance check complete')
            assert.equal(beforeTransferFromAllowance.sub(new BN(transferFromAmount)).toString(), afterTransferFromAllowance.toString());
            console.log('       Owner balance check complete')
            assert.equal(beforeTransferFromOwner.sub(new BN(transferFromAmount)).toString(), afterTransferFromOwner.toString());
            console.log('       Receiver balance check complete')
            assert.equal(beforeTransferFromDeployer.add(new BN(transferFromAmount)).toString(), afterTransferFromDeployer.toString());
        });
    });

    describe('Burn From', async() =>{
        it('Burn from owner is done successfully.', async() =>{
            let beforeBurnFromAllowance = await myErc20.allowance(owner, spender);
            let beforeBurnFromOwner = await myErc20.balanceOf(owner);
            burnFromReceipt = await myErc20.burnFrom(owner, burnAmount, {from: spender});
            let afterburnFromAllowance = await myErc20.allowance(owner, spender);
            let afterburnFromOwner = await myErc20.balanceOf(owner);
            console.log('       Allowance check complete')
            assert.equal(beforeBurnFromAllowance.sub(new BN(burnAmount)).toString(), afterburnFromAllowance.toString());
            console.log('       Owner balance check complete')
            assert.equal(beforeBurnFromOwner.sub(new BN(burnAmount)).toString(), afterburnFromOwner.toString());
        });
    });

   /* describe('Adding and sellig item', async()=>{
        let result, totalNumber

        before(async ()=>{
            result = await ethbay.createItem('T-Shirt', web3.utils.toWei('1', 'Ether'),{from: seller})
            totalNumber = await ethbay.totalNumber()
        })
        it ('Creating item should be successful if all correct', async ()=>{
            //SUCCESSFUL
            assert.equal(totalNumber,1);
            const event = result.logs[0].args;
            assert.equal(event.itemId.toNumber(), totalNumber.toNumber(), 'item id is correct');
            assert.equal(event.itemName, 'T-Shirt','item name is correct');
            assert.equal(event.itemPrice, '1000000000000000000','item price is correct');
            assert.equal(event.itemOwner, seller, 'item owner is correct');
            assert.equal(event.isItemSold, false, 'item not sold is correct');
        })

        it ('Creating item should be failed if either no name or no price', async ()=>{
            //Product must have a name
            await ethbay.createItem('', web3.utils.toWei('1','Ether'), {from: seller}).should.be.rejected;
            //Price must be greater than 0
            await ethbay.createItem('T-Shirt', web3.utils.toWei('0','Ether'), {from: seller}).should.be.rejected;
        })

        it ('Check the item created', async ()=>{
            const item = await ethbay.items(totalNumber);
            assert.equal(item.itemId.toNumber(), totalNumber.toNumber(), 'Item id is correct');
            assert.equal(item.itemName, 'T-Shirt','Item name is correct');
            assert.equal(item.itemPrice, '1000000000000000000','Item price is correct');
            assert.equal(item.itemOwner, seller, 'Item owner is correct');
            assert.equal(item.isItemSold, false, 'item not sold is correct');
        })

        it('Sell the item', async () => {
            let sellerOldBalance;
            sellerOldBalance = await web3.eth.getBalance(seller);
            sellerOldBalance = new web3.utils.BN(sellerOldBalance);

            // SUCCESS: Buyer makes purchase
            result = await ethbay.buyItem(totalNumber, {from: buyer, value: web3.utils.toWei('1', 'Ether')});

            // Check Log
            const event = result.logs[0].args;
            assert.equal(event.itemId.toNumber(), totalNumber.toNumber(), 'Item id is correct');
            assert.equal(event.itemName, 'T-Shirt','Item name is correct');
            assert.equal(event.itemPrice, '1000000000000000000','Item price is correct');
            assert.equal(event.itemOwner, buyer, 'Item owner is correct');
            assert.equal(event.isItemSold, true, 'Item sold is correct');

            // Check the seller receives the funds
            let sellerNewBalance;
            sellerNewBalance = await web3.eth.getBalance(seller);
            sellerNewBalance = await new web3.utils.BN(sellerNewBalance);

            let price;
            price = web3.utils.toWei('1', 'Ether');
            price = new web3.utils.BN(price);

            const expectedBalacne = sellerOldBalance.add(price);
            assert.equal(expectedBalacne.toString(), sellerNewBalance.toString());
        })
        it('Selling the item twice should be rejected', async () => {
            // FAILURE: Cannot be purchased twice
            await ethbay.buyItem(totalNumber, {from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
        })
        it('Selling the item with wrong Id should be rejected', async () => {
            // FAILURE: Invalid Item ID
            await ethbay.buyItem(99, {from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
        })
        it('Adding another testing item should be succefully done', async () => {
            await ethbay.createItem('Something', web3.utils.toWei('1', 'Ether'),{from: seller});
        })
        it('Buying the item with insufficient fund should be failed', async () => {
            // FAILURE: Invalid Value in Payment
            await ethbay.buyItem(totalNumber, {from: buyer, value: web3.utils.toWei('0.5', 'Ether')}).should.be.rejected;
        })

        it('Seller buying item from her/hisself should be rejected', async () => {
            // FAILURE: Invalid Buyer cannot be the Seller
            await ethbay.buyItem(totalNumber, {from: seller, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
        })


    })*/
});