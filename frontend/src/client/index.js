import React, { Component } from 'react';

class Client extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoId: null,
    }
  }

  componentDidMount() {
    this.ws = new WebSocket("ws://localhost:8999");
    // TODO: establish socket
    this.ws.onopen = (event) => {
      console.log('connected');
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.setState({
          videoId: data.videoId,
        })
      }
    };
  }

  render() {
    return (
      <div>
        { this.state.videoId &&
          <video src={`${this.state.videoId}.mp4`} autoPlay muted loop />
        }
      </div>
    );
  }
}

export default Client;
