import React, { Component } from 'react';
import Asset from './Asset';
import Connection from './Connection';
import Result from './Result';
import './Vessel.css';
require('dotenv').config({path:"/home/niusha/Desktop/Relay/relay/.env"})

class Vessel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            vesselState: 'connection',
            network: '',
            operation: '',
            // Ropsten
            //contractAddress1: "0x1EA7B61D7044F47456db8dcDbcc26edBa731ef4a",
            // bytes
            //contractAddress1: "0xD626E9CeAd55a801A716e79B91E49DE65CAa9d92",
            // string
            //contractAddress1: "0x367b122ec420e84509627e18b251a52B3999D3A9",
            // knows relay
            contractAddress1: process.env.REACT_APP_ROPSTEN_ASSET,
            // Kovan
            //contractAddress2: "0x84Bb6B3b39b2906A3fFF05801A98B6f9CE5a62dA",
            // bytes
            //contractAddress2: "0x744FffF2559a58201380397B5A70c93964fDc7E8",
            // string
            //contractAddress2: "0x718fD163ef56E9F81C3e1E630b2411140F809049"
            // knows relay
            contractAddress2: process.env.REACT_APP_KOVAN_ASSET,
        };

        this.setNetwork = async (network) => {
            this.setState({network: network});
        }
        this.setVesselState = async (vesselState) => {
            this.setState({vesselState: vesselState})
        }
        this.setOperation = async (op) => {
            this.setState({operation: op})
        }
        this.shouldPrintProof = async (op) => {
            if (op == "Locking" || op == "Burning") {
                this.setState({printProof: true})
            } else {
                this.setState({printProof: false})
            }
        }
        this.connect = async (networkNo) => {
            if (networkNo == 1) {
                await this.props.connectToBlockchain(this.state.contractAddress1, 1);
            }
            if (networkNo == 2) {
                await this.props.connectToBlockchain(this.state.contractAddress2, 2);
            }
        }
    }

    renderSwitch(vesselState) {
        switch(vesselState) {
            case 'Loading':
                return <div><h1>Loading...</h1></div>
            case 'connection':
                return <Connection connectToBlockchain = {this.props.connectToBlockchain.bind(this)}
                                   connectToRelay = {this.props.connectToRelay.bind(this)}
                                   setNetwork = {this.setNetwork.bind(this)}
                                   setVesselState = {this.setVesselState.bind(this)} 
                                   connect = {this.connect.bind(this)}
                />;
            case 'Asset':
                return <Asset network = {this.state.network}
                              getBlockHeight = {this.props.getBlockHeight.bind(this)}
                              locker = {this.props.locker.bind(this)}
                              unlocker = {this.props.unlocker.bind(this)}
                              minter = {this.props.minter.bind(this)}
                              setVesselState = {this.setVesselState.bind(this)}
                              setOperation = {this.setOperation.bind(this)}
                              shouldPrintProof = {this.shouldPrintProof.bind(this)}
                />;
            case 'Result':
               return <Result operation = {this.state.operation}
                              setVesselState = {this.setVesselState.bind(this)}
                              setNetwork = {this.setNetwork.bind(this)}
                              connectToBlockchain = {this.props.connectToBlockchain.bind(this)}
                              connect = {this.connect.bind(this)}
                              firstConnected = {this.props.firstConnected}
                              secondConnected = {this.props.secondConnected}
                              transactionHash = {this.props.transactionHash}
                              proof = {this.props.proof}
                              printProof = {this.state.printProof}
               />
        }
    }

    render() {
        return(
            <div className='outerBox'>
                <div className='innerBox'>
                    {this.renderSwitch(this.state.vesselState)}
                </div>
            </div>
        );
    }
}

export default Vessel;