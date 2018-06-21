import React, { Component } from 'react';

class ClientList extends Component {
  render() {
    return (
      <div>
        Select a client to send video to:
        <ul>
          <li
              key="all"
              style={{ color: this.props.selectedClient === 'all' ? 'green' : 'black', cursor: 'pointer' }}
              onClick={() => { this.props.handleClientSelect('all') }}
            >
            all clients
            </li>
          {this.props.clientList.map((client) => {
            return (
              <li
                key={client}
                style={{ color: this.props.selectedClient === client ? 'green' : 'black', cursor: 'pointer' }}
                onClick={() => { this.props.handleClientSelect(client) }}
              >
                {client}
              </li>
            );
          })}
        </ul>
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
