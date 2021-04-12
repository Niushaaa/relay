import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
///// VERY IMPORTANT!!!!
import AssetTransfer from './abis/AssetTransfer3'
//import Relay from './abis/Relay'
//import AssetTransfer2 from './abis/AssetTransfer2'
import Addressbar from './components/Addressbar'
import Connection from './components/Connection'
//import './components/Connection.css'
import Main from './components/Main'
import Vessel from './components/Vessel';
import MerkleProofGenerator from './MerkleProofGenerator'

//const merkleProofGenerator = require('MerkleProofGenerator');

class App extends Component {
  constructor(props) {
    super(props);
    let blockHeights = new Map();
    this.state = {
      account1: '',
      account2: '',
      loading: '',
      balance1: 0,
      balance2: 0,
      firstConnected: false,
      secondConnected: false,
      proof: '',
      transactionHash: '',
      RopstenProvider: "https://ropsten.infura.io/v3/c77278c789ae4a8ab4e61423cc74f9cd",
      KovanProvider: "https://kovan.infura.io/v3/c77278c789ae4a8ab4e61423cc74f9cd",
      relayAddress: '',
      deployedRelay: '',
      blockHeights: blockHeights,
    };
    this.getBalance1 = async (getBalanceAccount) => {
      //const gasAmount = this.state.deployedAssetTransfer.methods.getBalance(getBalanceAccount).estimateGas({from: this.state.account});
      let balance = await this.state.deployedAssetTransfer1.methods.getBalance(getBalanceAccount).call();
      this.setState({balance1: balance});
    }
    this.getBalance2 = async (getBalanceAccount) => {
      //const gasAmount = this.state.deployedAssetTransfer.methods.getBalance(getBalanceAccount).estimateGas({from: this.state.account});
      let balance = await this.state.deployedAssetTransfer2.methods.getBalance(getBalanceAccount).call();
      this.setState({balance2: balance});
    }
    this.getBlockHeight = async (transactionHash) => {
      let height = await this.state.blockHeights.get(transactionHash);
      return height.height;
      //return this.state.blockHeights.get(transactionHash);
    }
    this.locker = async (amount, networkNo) => {
      const web3 = window.web3;
      if (networkNo == 1) {
        const gasAmount = await this.state.deployedAssetTransfer1.methods.lock(amount).estimateGas({from: this.state.account1});
        console.log(gasAmount)
        let lockReceipt = await this.state.deployedAssetTransfer1.methods.lock(amount).send({from: this.state.account1, gas: gasAmount});
        console.log("transaction hash is")
        console.log(lockReceipt.transactionHash)
        let returnedProof = await MerkleProofGenerator.MerkleProofGenerator(this.state.RopstenProvider, lockReceipt.transactionHash);
        this.setState({proof: returnedProof});
        this.setState({transactionHash: lockReceipt.transactionHash});
        console.log("App - Block height is:")
        console.log(lockReceipt.blockNumber)
        let blockHeights = this.state.blockHeights;
        blockHeights.set(lockReceipt.transactionHash, {height: lockReceipt.blockNumber});
        this.setState({blockHeights: blockHeights});
        console.log("Account 1 locked successfully.");
      } else {
        const gasAmount = await this.state.deployedAssetTransfer2.methods.lock(amount).estimateGas({from: this.state.account2});
        let lockReceipt = await this.state.deployedAssetTransfer2.methods.lock(amount).send({from: this.state.account2, gas: gasAmount})
        console.log("transaction hash is")
        console.log(lockReceipt.transactionHash)
        let returnedProof = await MerkleProofGenerator.MerkleProofGenerator(this.state.KovanProvider, lockReceipt.transactionHash);
        this.setState({proof: returnedProof});
        this.setState({transactionHash: lockReceipt.transactionHash});
        console.log("App - Block height is:")
        console.log(lockReceipt.blockNumber)
        let blockHeights = this.state.blockHeights;
        blockHeights.set(lockReceipt.transactionHash, {height: lockReceipt.blockNumber});
        console.log("Proof is")
        console.log(this.state.proof)
        console.log("Account 2 locked successfully.")
      }
    }
    this.unlocker = async (blockNumber, rawTransaction, encodedPath, rlpParentNodes, networkNo) => {
      if (networkNo == 1) {
        const gasAmount = await this.state.deployedAssetTransfer1.methods.unlock(blockNumber, rawTransaction, encodedPath, rlpParentNodes).estimateGas({from: this.state.account1});
        await this.state.deployedAssetTransfer1.methods.unlock(blockNumber, rawTransaction, encodedPath, rlpParentNodes).send({from: this.state.account1, gas: gasAmount})
        console.log("Account 1 unlocked successfully.")  
      } else {
        //const gasAmount = await this.state.deployedAssetTransfer2.methods.unlock(blockNumber, rawTransaction, encodedPath, rlpParentNodes).estimateGas({from: this.state.account2});
        await this.state.deployedAssetTransfer2.methods.unlock(blockNumber, rawTransaction, encodedPath, rlpParentNodes).send({from: this.state.account2})
        console.log("Account 2 unlocked successfully.")
      }
    }
    this.minter = async (blockNumber, rawTransaction, encodedPath, rlpParentNodes, networkNo) => {
      if (networkNo == 1) {
        const gasAmount = await this.state.deployedAssetTransfer1.methods.mint(blockNumber, rawTransaction, encodedPath, rlpParentNodes).estimateGas({from: this.state.account1});
        await this.state.deployedAssetTransfer1.methods.mint(blockNumber, rawTransaction, encodedPath, rlpParentNodes).send({from: this.state.account1, gas: gasAmount})
        console.log("Account 1 unlocked successfully.")  
      } else {
        console.log("before mint:", rawTransaction);
        //const gasAmount = await this.state.deployedAssetTransfer2.methods.mint(blockNumber, '0x' + rawTransaction, '0x' + encodedPath, '0x' + rlpParentNodes).estimateGas({from: this.state.account2});
        //await this.state.deployedAssetTransfer2.methods.mint(blockNumber, rawTransaction, encodedPath, rlpParentNodes).send({from: this.state.account2, gas: gasAmount})
        await this.state.deployedAssetTransfer2.methods.mint(blockNumber, rawTransaction, encodedPath, rlpParentNodes).send({from: this.state.account2})
        console.log("Account 2 unlocked successfully.")
      }
    }
    this.connectToRelay = async () => {
      //let deployedRelay = new web3.eth.Contract(Relay, this.state.relayAddress)
      //this.setState({deployedRelay: deployedRelay})
    }
    this.connectToBlockchain = async (contractAddress, contractNo) => {
      const web3 = window.web3;
      console.log("Provider is")
      console.log(web3.providers.HttpProvider);
      //console.log(web3);
      
      const accounts = await web3.eth.getAccounts();
      if (contractNo == 1) {
        this.setState({account1: accounts[0]});
        console.log(this.state.account1);
      } else {
        this.setState({account2: accounts[0]});
        console.log(this.state.account2);
      }
      //this.setState({relayAccount: accounts[2]});
      const networkId = await web3.eth.net.getId();
      console.log(networkId);
      //const networkData = AssetTransfer.networks[networkId];
      //console.log(networkData);
      if(true) {
        //const deployedAssetTransfer = new web3.eth.Contract(AssetTransfer.abi, networkData.address)
        const deployedAssetTransfer = new web3.eth.Contract(AssetTransfer, contractAddress);
        if (contractNo == 1) {
          this.setState({deployedAssetTransfer1: deployedAssetTransfer});
          this.setState({firstConnected: true})
          console.log("Connected to the first blockchain!");
          for (var i = 1; i <= accounts.length; i++) {
            console.log("Iterating for freeMint() in the first blockchain!");
            const gasAmount1 = await this.state.deployedAssetTransfer1.methods.freeMint().estimateGas({from: this.state.account1});
            console.log("before freeMint() in the first blockchain!");
            await this.state.deployedAssetTransfer1.methods.freeMint().send({from: this.state.account1, gas: gasAmount1});
            console.log("after freeMint() in the first blockchain!");
            let balance1 = await this.state.deployedAssetTransfer1.methods.getBalance(this.state.account1).call({from: this.state.account1});
            console.log(balance1)
          }
        } else {
          this.setState({deployedAssetTransfer2: deployedAssetTransfer});
          this.setState({secondConnected: true})
          console.log("Connected to the second blockchain!");
          //console.log(accounts);
          for (var j = 1; j <= accounts.length; j++) {
            console.log("Iterating for freeMint() in the second blockchain!");
            const gasAmount2 = await this.state.deployedAssetTransfer2.methods.freeMint().estimateGas({from: this.state.account2});
            console.log("before freeMint() in the second blockchain!");
            await this.state.deployedAssetTransfer2.methods.freeMint().send({from: this.state.account2, gas: gasAmount2});
            console.log("after freeMint() in the second blockchain!");
            let balance2 = await this.state.deployedAssetTransfer2.methods.getBalance(this.state.account2).call({from: this.state.account2});
            console.log(balance2)
          }
        }
        //console.log(accounts.length);
      } else {
        window.alert('AssetTransfer contract is not found in the blockchain.');
      }  
    }
  }


  //async componentDidMount(){
    //await this.getWeb3Provider();
    //await this.connectToBlockchain();
  //}

  /*async getWeb3Provider(){
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      console.log("Done!");
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      console.log("Done else if!")
    }
    else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
        console.log("Done else!")
    }
  }*/

  /*async connectToBlockchain(){
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({account: accounts[0]});
    console.log(this.state.account);
    //this.setState({relayAccount: accounts[2]});
    const networkId = await web3.eth.net.getId();
    console.log(networkId);
    //const networkData = AssetTransfer.networks[networkId];
    //console.log(networkData);
    // kovan
    const contractAddress1 = "0x84Bb6B3b39b2906A3fFF05801A98B6f9CE5a62dA";
    // ropsten
    const contractAddress2 = "0x1EA7B61D7044F47456db8dcDbcc26edBa731ef4a";
    if(true) {
      //const deployedAssetTransfer = new web3.eth.Contract(AssetTransfer.abi, networkData.address)
      const deployedAssetTransfer1 = new web3.eth.Contract(AssetTransfer2, contractAddress1);
      const deployedAssetTransfer2 = new web3.eth.Contract(AssetTransfer2, contractAddress2);
      this.setState({deployedAssetTransfer2: deployedAssetTransfer2});
      this.setState({deployedAssetTransfer1: deployedAssetTransfer1});
      console.log("Before deploy");
      //deployedAssetTransfer.deploy({data: bytecode, arguments: [this.state.relayAccount, 5]}).send({from: this.state.account});
      console.log("After deploy");
      console.log(accounts.length);
      for (var i = 1; i <= accounts.length; i++) {
        console.log("Iterating2!");
        const gasAmount2 = await this.state.deployedAssetTransfer2.methods.freeMint().estimateGas({from: this.state.account});
        console.log("before freeMint2");
        await this.state.deployedAssetTransfer2.methods.freeMint().send({from: this.state.account, gas: gasAmount2});
        console.log("After freeMint2");
        let balance2 = await this.state.deployedAssetTransfer2.methods.getBalance(this.state.account).call({from: this.state.account});
        console.log(balance2)

        console.log("Iterating1!");
        const gasAmount1 = await this.state.deployedAssetTransfer1.methods.freeMint().estimateGas({from: this.state.account});
        console.log("before freeMint1");
        await this.state.deployedAssetTransfer1.methods.freeMint().send({from: this.state.account, gas: gasAmount1});
        console.log("After freeMint1");
        let balance1 = await this.state.deployedAssetTransfer1.methods.getBalance(this.state.account).call();
        console.log(balance1)
      }
    } else {
      window.alert('AssetTransfer contract is not found in the blockchain.');
    }
  }*/

  render() {
    return(
      <div>
        {/*<Addressbar account={this.state.account}/>*/}
        {/*<Connection connectToBlockchain = {this.connectToBlockchain.bind(this)}/>*/}
        <br></br>
        <Vessel connectToBlockchain = {this.connectToBlockchain.bind(this)}
                connectToRelay = {this.connectToRelay.bind(this)}
                getBlockHeight = {this.getBlockHeight.bind(this)}
                locker = {this.locker.bind(this)}
                unlocker = {this.unlocker.bind(this)}
                minter = {this.minter.bind(this)}
                firstConnected = {this.state.firstConnected}
                secondConnected = {this.state.secondConnected}
                transactionHash = {this.state.transactionHash}
                proof = {this.state.proof}
        />
        <br></br>
        <div className="outerBox">
        <br></br>
          <div className="Connection">
            <h5>Ropsten balance</h5>
            <Main getBalance = {this.getBalance1}/>
            <div className="outerBox">
              <p>{this.state.balance1}</p>
            </div>
          </div>
          <div className="Connection">
            <h5>kovan balance</h5>
            <Main getBalance = {this.getBalance2}/>
            <div className="outerBox">
              <p>{this.state.balance2}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

}



export default App;
