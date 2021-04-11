import React, { Component } from 'react';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      balance: null,
    };
  }
  render() {
    return (
      <div id="content">
        <h3>Enter account address</h3>
        <form onSubmit = 
          {async (event) => {
            event.preventDefault();
            const getBalanceAccount = this.getBalanceAccount.value
            await this.props.getBalance(getBalanceAccount)
            }
          }>
        <div className="form-group mr-sm-2">
            <input 
            id="getBalanceAccount"
            type="text"
            ref={(input)=>{this.getBalanceAccount=input}}
            className="form-control"
            placeholder="Account Address"
            required/>
        </div>
        <button type="submit" className="btn btn-primary">Get balance</button>
        </form>
        <p>&nbsp;</p>
        <p>{this.state.balance}</p>
        {/*<h2>Buy Item</h2>
        <table className="table">
        <thead id="itemList">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Item Name</th>
            <th scope="col">Selling Price</th>
            <th scope="col">Owner Address</th>
            <th scope="col"></th>
          </tr> 
        </thead>
        <tbody id="itemList">
            {this.props.items.map((item, key)=>{
                return(
                    <tr key={key}>
                    <th scope="row">{item.itemId.toString()}</th>   
                    <td>{item.itemName}</td> 
                    <td>{window.web3.utils.fromWei(item.itemPrice.toString(), 'Ether')} ETH </td>
                    <td>{item.itemOwner}</td>
                    <td>
                      {
                        !item.isItemSold
                          ?
                          <button 
                            id = {item.itemId}
                            value = {item.itemPrice}
                            onClick={async (event)=>{
                              await this.props.buyItem(event.target.id, event.target.value);
                            }}
                          >
                            Buy
                          </button>
                          : 
                          null
                        }
                    </td>
                  </tr>
                )
            })}
        </tbody>
        </table>*/}
      </div>
    );
  }
}

export default Main;    