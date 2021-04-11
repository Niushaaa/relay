import React, { Component } from 'react';
import './Connection.css';

class Result extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div className="Connection">
                <h1>The {this.props.operation} was successful!</h1>
                <h3>Here is your proof.</h3>
                <h3 className="overflowConnection">{this.props.proof.CompleteProof},{this.props.transactionHash}</h3>
                <form onSubmit = 
                    {async (event) => {
                        event.preventDefault();    
                        this.props.setNetwork("Ropsten")
                        if (this.props.firstConnected == true) {
                            console.log("firstConnected is true")
                            this.props.setVesselState("Asset")
                        } else {
                            await this.props.setVesselState("Loading")
                            //await this.props.connectToBlockchain(this.props.contractAddress1, 1);
                            await this.props.connect(1)
                            this.props.setVesselState("Asset")
                        }
                    }
                }>
                <button type="submit" className="lineLeft">Go to Ropsten</button>
                </form>
                {/*<h2>Kovan</h2>*/}
                <form onSubmit = 
                    {async (event) => {
                        event.preventDefault();
                        this.props.setNetwork("Kovan")
                        if (this.props.secondConnected == true) {
                            console.log("secondConnected is true")
                            this.props.setVesselState("Asset")
                        } else {
                            await this.props.setVesselState("Loading")
                            //await this.props.connectToBlockchain(this.props.contractAddress2, 2);
                            await this.props.connect(2)
                            this.props.setVesselState("Asset")
                        }
                    }
                }>
                <button type="submit" className="lineRight">Go to Kovan</button>    
                </form>
            </div>
        )
    }
}

export default Result;