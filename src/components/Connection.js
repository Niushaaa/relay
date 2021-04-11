import React, { Component } from 'react';
import Web3 from 'web3';
import './Connection.css';

class Connection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Ropsten
            contractAddress1: "0x1EA7B61D7044F47456db8dcDbcc26edBa731ef4a",
            // Kovan
            contractAddress2: "0x84Bb6B3b39b2906A3fFF05801A98B6f9CE5a62dA",
        };
    }

    //async componentDidMount(){
    //    await this.getWeb3Provider();
        //await this.connectToBlockchain();
    //}

    async getWeb3Provider(){
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum);
          //console.log("window is");
          //console.log(window.ethereum);
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
    }

    render() {
        return (
            <div className='Connection'>
                <h1>Welcome to the Asset Relay DApp!</h1>
                {/*<h2>Ropsten</h2>*/}
                <form onSubmit = 
                    {async (event) => {
                    event.preventDefault();    
                    await this.getWeb3Provider();
                    await this.props.setVesselState("Loading")
                    //await this.props.connectToBlockchain(this.state.contractAddress1, 1);
                    await this.props.connect(1)
                    await this.props.connectToRelay()
                    await this.props.setNetwork("Ropsten")
                    await this.props.setVesselState("Asset")
                    }
                }>
                <button type="submit" className="lineLeft">Connect to Ropsten</button>
                </form>
                {/*<h2>Kovan</h2>*/}
                <form onSubmit = 
                    {async (event) => {
                    event.preventDefault();
                    await this.getWeb3Provider();
                    await this.props.setVesselState("Loading")
                    //await this.props.connectToBlockchain(this.state.contractAddress2, 2);
                    await this.props.connect(2)
                    await this.props.connectToRelay()
                    await this.props.setNetwork("Kovan")
                    await this.props.setVesselState("Asset")
                    }
                }>
                <button type="submit" className="lineRight">Connect to Kovan</button>    
                </form>
            </div>
        );
    }
}

export default Connection;