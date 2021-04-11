import React, { Component } from 'react'
import web3 from 'web3'
import './Connection.css'

class Asset extends Component {
    constructor(props) {
        super(props);
        this.state = {
            network: '',
            isSrc: '',
        };
        this.getNetworkNo = async () => {
            if (this.props.network == "Ropsten") {
                return 1
            }
            if (this.props.network == "Kovan") {
                return 2
            }
        }
        this.hexToBytes = function (hex) {
            for (var bytes = [], c = 2; c < hex.length; c += 2)
            bytes.push(parseInt(hex.substr(c, 2), 16));
            return bytes;
        }
    }

    render() {
        return(
            <div>
                <h1>
                    Welcome to the {this.props.network} network!
                </h1>
                <div className="Connection">
                    <div className="lineLeft">
                        <div className="box">
                            <form onSubmit = 
                                {async (event) => {
                                event.preventDefault();
                                let lockingAmount = this.lockAmount.value
                                await this.props.setVesselState("Loading")
                                await this.props.setOperation("Locking")
                                let networkNo = await this.getNetworkNo(this.props.network)
                                //await this.props.setVesselState("Loading")
                                await this.props.locker(lockingAmount, networkNo)
                                await this.props.setVesselState("Result")
                                }
                            }>
                            <button type="submit">Lock</button>
                            <div>
                                &nbsp;
                                <input 
                                    id="lockAmount"
                                    type="text"
                                    ref={(input)=>{this.lockAmount=input}}
                                    className="form-control"
                                    placeholder="Enter the amount"
                                    required/>
                            </div>
                            </form>
                        </div>
                        <br></br>
                        <div>
                            <br></br>
                            <form onSubmit = 
                                {async (event) => {
                                event.preventDefault();
                                let unlockingAmount = this.unlockAmount.value
                                //let unlockingProof = web3.utils.asciiToHex(this.unlockProof.value)
                                //unlockingProof = web3.utils.hexToBytes(unlockingProof)

                                let unlockingProof = this.unlockProof.value
                                unlockingProof = unlockingProof.split(",");
                                var rawTransaction = unlockingProof[0]
                                var encodedPath = unlockingProof[1]
                                var rlpParentNodes = unlockingProof[2]
                                var transactionHash = unlockingProof[unlockingProof.length-1]
                                var blockNumber = await this.props.getBlockHeight(transactionHash)
                                console.log("Block height is")
                                console.log(blockNumber)
                                console.log("typeof rlpParentNodes is:")
                                console.log(typeof rlpParentNodes)
                                console.log(unlockingProof)
                                //let unlockingProof = web3.utils.utf8ToHex(this.unlockProof.value)
                                //let unlockingProof = this.unlockProof.value
                                //unlockingProof = unlockingProof.toString()
                                console.log("unlockProof")
                                console.log(this.unlockProof.value)
                                console.log("unlockingProof")
                                console.log(unlockingProof)
                                console.log("unlockingAmount")
                                console.log(unlockingAmount)
                                console.log("typeof unlockingProof")
                                console.log(typeof unlockingProof)
                                await this.props.setVesselState("Loading")
                                await this.props.setOperation("Unlocking")
                                let networkNo = await this.getNetworkNo(this.props.network)
                                //await this.props.setVesselState("Loading")
                                console.log("networkNo")
                                console.log(networkNo)
                                await this.props.unlocker(blockNumber, rawTransaction, encodedPath, rlpParentNodes, networkNo)
                                await this.props.setVesselState("Result")
                                }
                            }>
                            <div>
                                <button type="submit">Unlock</button>
                                <div>
                                    &nbsp;
                                    <input 
                                        id="unlockAmount"
                                        type="text"
                                        ref={(input)=>{this.unlockAmount=input}}
                                        className="form-control"
                                        placeholder="Enter the amount"
                                        required/>
                                </div>

                            </div>
                            &emsp;
                            &emsp;
                            &emsp;
                            &nbsp;
                            <div>
                                <br></br>
                                <input 
                                    id="unlockProof"
                                    type="text"
                                    ref={(input)=>{this.unlockProof=input}}
                                    className="form-control"
                                    placeholder="Enter the proof"
                                    required/>    
                            </div>
                            </form>
                        </div>
                    </div>
                    <div className="lineRight">
                        {/*&emsp;*/}
                        <div className="box">
                            <form onSubmit = 
                                {async (event) => {
                                event.preventDefault();
                                let mintingAmount = this.mintAmount.value
                                //let unlockingProof = web3.utils.asciiToHex(this.unlockProof.value)
                                //unlockingProof = web3.utils.hexToBytes(unlockingProof)

                                let mintingProof = this.mintProof.value
                                mintingProof = mintingProof.split(",");
                                var rawTransaction = mintingProof[0]
                                console.log("Initial rawTransaction is:")
                                console.log(rawTransaction)
                                //rawTransaction = web3.utils.hexToBytes(rawTransaction);
                                //console.log("web3 hexToBytes of rawTransaction is")
                                //console.log(web3.utils.hexToBytes(rawTransaction))
                                //rawTransaction = this.hexToBytes(rawTransaction);
                                var encodedPath = mintingProof[1]
                                //encodedPath = web3.utils.hexToBytes(encodedPath);
                                //encodedPath = this.hexToBytes(encodedPath);
                                var rlpParentNodes = mintingProof[2]
                                //rlpParentNodes = web3.utils.hexToBytes(rlpParentNodes);
                                //rlpParentNodes = this.hexToBytes(rlpParentNodes);
                                var transactionHash = mintingProof[mintingProof.length-1]
                                console.log("transactionHash is")
                                console.log(transactionHash)
                                var web3_ropsten = new web3('https://ropsten.infura.io/v3/c2f337d22d8b4a849f482d304ddcd963');

                                var blockNumber = await (await web3_ropsten.eth.getTransaction(transactionHash)).blockNumber
                                // var blockNumber = await this.props.getBlockHeight(transactionHash)
                                console.log("Block height is")
                                console.log(blockNumber)
                                console.log("rlpParentNodes is")
                                console.log(rlpParentNodes)
                                console.log("encodedPath is")
                                console.log(encodedPath)
                                console.log("rawTransaction is")
                                console.log(rawTransaction)
                                //console.log("Converting rawTransaction back:")
                                //console.log(web3.utils.bytesToHex(rawTransaction))
                                console.log("typeof rlpParentNodes is:")
                                console.log(typeof rlpParentNodes)
                                console.log("typeof encodedPath is:")
                                console.log(typeof encodedPath)
                                console.log("typeof rawTransaction is:")
                                console.log(typeof rawTransaction)
                                console.log("typeof blockNumber is:")
                                console.log(typeof blockNumber)
                                //let mintingProof = web3.utils.utf8ToHex(this.mintProof.value)
                                //let mintingProof = this.mintProof.value
                                //mintingProof = mintingProof.toString()
                                console.log("mintingProof")
                                console.log(mintingProof)
                                console.log("mintingAmount")
                                console.log(mintingAmount)
                                console.log("typeof mintingProof")
                                console.log(typeof mintingProof)
                                await this.props.setVesselState("Loading")
                                await this.props.setOperation("minting")
                                let networkNo = await this.getNetworkNo(this.props.network)
                                //await this.props.setVesselState("Loading")
                                console.log("networkNo")
                                console.log(networkNo)
                                await this.props.minter(blockNumber, rawTransaction, encodedPath, rlpParentNodes, networkNo)
                                await this.props.setVesselState("Result")
                                }
                            }>
                            <button type="submit">Mint</button>
                            <div>
                                &nbsp;
                                <input 
                                    id="mintAmount"
                                    type="text"
                                    ref={(input)=>{this.mintAmount=input}}
                                    className="form-control"
                                    placeholder="Enter the amount"
                                    required/>
                            </div>
                            <div>
                                <br></br>
                                <input 
                                    id="mintProof"
                                    type="text"
                                    ref={(input)=>{this.mintProof=input}}
                                    className="form-control"
                                    placeholder="Enter the proof"
                                    required/>    
                            </div>
                            </form>
                        </div>
                        <br></br>
                        <div>
                            <br></br>
                            <button type="submit">Burn</button>
                            <div>
                                <br></br>
                                <input 
                                    id="getBalanceAccount"
                                    type="text"
                                    ref={(input)=>{this.getBalanceAccount=input}}
                                    className="form-control"
                                    placeholder="Enter the amount"
                                    required/>    
                            </div>
                        </div>
                    
                    </div>
                </div>
            </div>
        );
    }
}

export default Asset;