import React, { Component } from 'react';
import config from '../config.js';
import TimingInfo from './timingInfo';
import './client.css';

class Client extends Component {
  constructor(props) {
    super(props);
    this.video1 = React.createRef();
    this.video2 = React.createRef();
    this.state = {
      videoId1: null,
      videoId2: null,
      currentVidElement: 1,
    }
    this.renderVideoElements = this.renderVideoElements.bind(this);
    this.onPlay = this.onPlay.bind(this);
  }

  openWs() {
    this.ws = new WebSocket(config.socketEndpoint);
    // this.ws = new WebSocket("ws://67.205.170.55:8080");
    // TODO: establish socket
    this.ws.onopen = (event) => {
      console.log('connected');
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
        if (data.msgType === 'sendVideo') {
          const { videoId, ...rest } = data;
          const nextVidElement = this.state.currentVidElement === 1 ? 2 : 1;
          this.setState({
            [`videoId${nextVidElement}`]: videoId,
            // currentVidElement: nextVidElement,
          });
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

  onPlay(currentVidElement) {
    console.log('playing');
    this.setState({
      currentVidElement,
    });
    const otherId = currentVidElement === 1 ? 2: 1;
    const toRef = `video${otherId}`;
    const element = this[toRef].current;
    element.pause();
    // console.log(element);
  }

  renderVideoElements() {
    return (
      <div>
        <video ref={this.video1}
          style={{ display: this.state.currentVidElement === 1 ? 'block' : 'none'}}
          src={`http://67.205.170.55:8080/${this.state.videoId1}.mp4`}
          onPlay={() => {this.onPlay(1)}}
          autoPlay muted loop
        />
        <video ref={this.video2}
          style={{ display: this.state.currentVidElement === 2 ? 'block' : 'none'}}
          src={`http://67.205.170.55:8080/${this.state.videoId2}.mp4`}
          onPlay={() => {this.onPlay(2)}}
          autoPlay muted loop
        />
      </div>
    )
  }

  render() {
    return (
      <div>
        {(this.state.videoId1 || this.state.videoId2) && this.renderVideoElements()}
      </div>
    );
  }
}

export default Client;
