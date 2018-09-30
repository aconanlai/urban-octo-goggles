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
      selectedVideoList: 'lightdownward,headback3app,resting',
      selectedImage: null,
      selectedImageList: 'light3,text_byod,face_red',
      selectedMediaType: 'video',
      selectedMode: 'random',
      selectedInterval: 1000,
      selectedImageDuration: 500,
      videoList: [
        'blink',
        'headback2app',
        'headback2',
        'headback3app',
        'headback',
        'lightdownward',
        'lightupward',
        'logovid',
        'phone',
        'resting',
      ],
      imageList: [
        'alternate',
        'art1',
        'art2',
        'back',
        'bedroom',
        'black',
        'claphandsnow',
        'ebk_iphone2',
        'ebk_iphone3',
        'ebk_iphone',
        'ebk_logo',
        'face10',
        'face11',
        'face12',
        'face13',
        'face1',
        'face2',
        'face3',
        'face4',
        'face7',
        'face9',
        'face',
        'face_red',
        'face_white',
        'far2',
        'far3',
        'far',
        'idk',
        'koolaid2',
        'koolaid',
        'light10',
        'light1',
        'light2',
        'light3',
        'light4',
        'light5',
        'light6',
        'light7',
        'light8',
        'light9',
        'lol',
        'lta2',
        'lta3',
        'lta',
        'mask1',
        'mask2',
        'mask3',
        'mask4',
        'mm',
        'nature1_2',
        'nature1',
        'nature2',
        'nature4',
        'nature5',
        'statue',

      ],
    }
    this.handleClientPercentageSelect = this.handleClientPercentageSelect.bind(this);
    this.handleMediaTypeSelect = this.handleMediaTypeSelect.bind(this);
    this.handleVideoSelect = this.handleVideoSelect.bind(this);
    this.handleModeSelect = this.handleModeSelect.bind(this);
    this.handleIntervalSelect = this.handleIntervalSelect.bind(this);
    this.handleVideoSend = this.handleVideoSend.bind(this);
    this.handleMultipleVideoSelect = this.handleMultipleVideoSelect.bind(this);
    this.handleImageSelect = this.handleImageSelect.bind(this);
    this.handleMultipleImageSelect = this.handleMultipleImageSelect.bind(this);
    this.handleImageDurationSelect = this.handleImageDurationSelect.bind(this);
  }

  openWs() {
    this.ws = new WebSocket(config.socketEndpoint);
    // this.ws = new WebSocket("ws://67.205.170.55:8080");
    // TODO: establish socket
    this.ws.onopen = (event) => {
      // console.log('connected');
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

  handleIntervalSelect(e) {
    this.setState({
      selectedInterval: e.target.value,
    })
  }

  handleMediaTypeSelect(e) {
    this.setState({
      selectedMediaType: e.target.value,
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

  handleImageSelect(image) {
    this.setState({
      selectedImage: image,
    })
  }

  handleMultipleImageSelect(e) {
    this.setState({
      selectedImageList: e.target.value,
    });
  }

  handleImageDurationSelect(e) {
    this.setState({
      selectedImageDuration: e.target.value,
    });
  }

  handleVideoSend() {
    const mediaType = this.state.selectedMediaType;
    // const now = new Date().getTime();
    console.log(`sending ${mediaType}`);
    let msgType;
    if (mediaType === 'video') {
      msgType = 'sendVideo';
    } else if (mediaType === 'image') {
      msgType = 'sendImage';
    } else {
      msgType = 'sendKill';
    }
    const payload = {
      msgType,
      mode: this.state.selectedMode,
      percentage: this.state.selectedClientPercentage,
      // videoIds: this.state.selectedMode === 'chase' ? this.state.selectedVideo : this.state.selectedVideoList,
      interval: this.state.selectedInterval,
    }
    if (mediaType === 'video') {
      payload.videoIds = this.state.selectedMode === 'chase' ? this.state.selectedVideo : this.state.selectedVideoList;
    } else {
      payload.imageIds = this.state.selectedMode === 'chase' ? this.state.selectedImage : this.state.selectedImageList;
      payload.imageDuration = this.state.selectedImageDuration
    }
    this.ws.send(JSON.stringify(payload));
  }

  render() {
    return (
      <div style={{ display: 'flex' }}>
        <VideoSelector
          {...this.state}
          handleMediaTypeSelect={this.handleMediaTypeSelect}
          handleVideoSelect={this.handleVideoSelect}
          handleModeSelect={this.handleModeSelect}
          handleMultipleVideoSelect={this.handleMultipleVideoSelect}
          handleImageSelect={this.handleImageSelect}
          handleMultipleImageSelect={this.handleMultipleImageSelect}
          handleIntervalSelect={this.handleIntervalSelect}
          handleImageDurationSelect={this.handleImageDurationSelect}
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
