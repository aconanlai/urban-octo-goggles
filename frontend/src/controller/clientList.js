import React, { Component } from 'react';

class ClientList extends Component {
  render() {
    return (
      <div>
        There are currently {this.props.clientList.length} client(s) connected.
        <br/>
        <br/>
        Select percentage of users to send to (number between 0 and 100):
        <br/>
        <input type="number" value={this.props.selectedClientPercentage} onChange={this.props.handleClientPercentageSelect} />
        <br/>
        <br/>
        <button
          onClick={this.props.handleVideoSend}
        >
          Send
        </button>
      </div>
    );
  }
}

export default ClientList;
