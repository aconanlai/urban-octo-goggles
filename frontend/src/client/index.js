import React, { Component } from 'react';
import TimingInfo from './timingInfo';

class Client extends Component {
  constructor(props) {
    super(props);
    this.video = React.createRef();
    this.state = {
      videoId: null,
      timingInfo: null,
    }
    this.setPlayedTime = this.setPlayedTime.bind(this);
  }

  setPlayedTime() {
    console.log('setting played time')
    this.setState({
      timingInfo: {
        ...this.state.timingInfo,
        videoPlayed: new Date().getTime(),
      }
    });
    this.video.current.removeEventListener('play', this.setPlayedTime);
  }

  openWs() {
    // this.ws = new WebSocket("ws://localhost:3001");
    this.ws = new WebSocket("ws://192.241.132.106/:3001");
    // TODO: establish socket
    this.ws.onopen = (event) => {
      console.log('connected');
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.msgType === 'sendVideo') {
          const { videoId, ...rest } = data;
          this.setState({
            videoId,
            timingInfo: {
              ...rest,
              clientReceived: new Date().getTime(),
              videoPlayed: 0,
            },
          }, () => {
            const listener = this.video.current.addEventListener('play', this.setPlayedTime);
          })
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

  render() {
    return (
      <div>
        {this.state.videoId}
        <br/>
        { this.state.timingInfo &&
          <TimingInfo {...this.state.timingInfo} />
        }
        { this.state.videoId &&
          <video ref={this.video} src={`${this.state.videoId}.mp4`} autoPlay muted loop />
        }
      </div>
    );
  }
}

export default Client;
