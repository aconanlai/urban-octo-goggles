import React, { Component } from 'react';
import config from '../config.js';
import ClientList from './clientList';
import VideoSelector from './videoSelector';
// import './controller.css';

class Controller extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clientList: [],
      selectedClientPercentage: 0,
      selectedVideo: null,
      selectedVideoList: 'ducks,forest,avatar',
      selectedMode: 'random',
      videoList: ['avatar', 'ducks', 'forest', 'waterfall', 'waves'],
    }
    this.handleClientPercentageSelect = this.handleClientPercentageSelect.bind(this);
    this.handleVideoSelect = this.handleVideoSelect.bind(this);
    this.handleModeSelect = this.handleModeSelect.bind(this);
    this.handleVideoSend = this.handleVideoSend.bind(this);
    this.handleMultipleVideoSelect = this.handleMultipleVideoSelect.bind(this);
  }

  openWs() {
    this.ws = new WebSocket(config.socketEndpoint);
    // this.ws = new WebSocket("ws://67.205.170.55:8080");
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

  handleClientPercentageSelect(e) {
    this.setState({
      selectedClientPercentage: e.target.value,
    });
  }

  handleModeSelect(mode) {
    this.setState({
      selectedMode: mode,
    })
  }

  handleVideoSelect(video) {
    this.setState({
      selectedVideo: video,
    })
  }

  handleMultipleVideoSelect(e) {
    this.setState({
      selectedVideoList: e.target.value,
    });
  }

  handleVideoSend() {
    // const now = new Date().getTime();
    console.log('sending video');
    const payload = {
      msgType: 'sendVideo',
      mode: this.state.selectedMode,
      percentage: this.state.selectedClientPercentage,
      videoIds: this.state.selectedMode === 'chase' ? this.state.selectedVideo : this.state.selectedVideoList, 
    }
    this.ws.send(JSON.stringify(payload));
  }

  render() {
    return (
      <div style={{ display: 'flex' }}>
        <VideoSelector
          {...this.state}
          handleVideoSelect={this.handleVideoSelect}
          handleModeSelect={this.handleModeSelect}
          handleMultipleVideoSelect={this.handleMultipleVideoSelect}
        />
        <ClientList
          {...this.state}
          handleClientPercentageSelect={this.handleClientPercentageSelect}
          handleVideoSend={this.handleVideoSend}
        />
      </div>
    );
  }
}

export default Controller;
