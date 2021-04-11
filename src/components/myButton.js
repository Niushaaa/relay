import React, { Component } from 'react';

class myButton extends Component {
  render() {
    return (
        <button 
        onClick={async (event)=>{
          await this.props.buyItem(event.target.id, event.target.value);
        }}
        >
        get Balance
        </button>
    );
  }
}

export default myButton;
