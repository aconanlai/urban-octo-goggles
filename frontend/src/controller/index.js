import React, { Component } from 'react';
import ClientList from './clientList';
import VideoSelector from './videoSelector';

class Controller extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clientList: [],
      selectedClient: null,
      selectedVideo: null,
      videoList: ['avatar', 'ducks', 'forest', 'waterfall', 'waves'],
    }
    this.handleClientSelect = this.handleClientSelect.bind(this);
    this.handleVideoSelect = this.handleVideoSelect.bind(this);
    this.handleVideoSend = this.handleVideoSend.bind(this);
  }

  openWs() {
    // this.ws = new WebSocket("ws://localhost:3001");
    this.ws = new WebSocket("ws://192.241.132.106/:3001");
    // TODO: establish socket
    this.ws.onopen = (event) => {
      console.log('connected');
      this.ws.send(JSON.stringify({
        msgType: 'registerController',
      }));
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        console.log(msg);
        switch (msg.msgType) {
          case 'clientList':
            this.setState({
              clientList: msg.clientList,
            });
            break;
          default:
            break;
        }
      }
    };
    this.ws.onclose = () => {
      setTimeout(() => {
        console.log('ws closed, auto re-connecting');
        this.openWs();
      }, 1000);
    };
  }

  componentDidMount() {
    this.openWs();
  }

  handleClientSelect(client) {
    this.setState({
      selectedClient: client,
    });
  }

  handleVideoSelect(video) {
    this.setState({
      selectedVideo: video,
    })
  }

  handleVideoSend() {
    const now = new Date().getTime();
    console.log('sending viodepo')
    this.ws.send(JSON.stringify({
      msgType: 'sendVideo',
      sent: now,
      videoId: this.state.selectedVideo,
      recipient: this.state.selectedClient,
    }));
  }

  render() {
    return (
      <div style={{ display: 'flex' }}>
        <VideoSelector
          {...this.state}
          handleVideoSelect={this.handleVideoSelect}
        />
        {this.state.clientList.length > 0 &&
          <ClientList
            {...this.state}
            handleClientSelect={this.handleClientSelect}
            handleVideoSend={this.handleVideoSend}
          />
        }
      </div>
    );
  }
}

export default Controller;
