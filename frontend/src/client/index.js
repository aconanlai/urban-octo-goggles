import React, { Component } from 'react';
import config from '../config.js';
import TimingInfo from './timingInfo';
import './client.css';

class Client extends Component {
  constructor(props) {
    super(props);
    this.randomInterval = null;
    this.randomTimeout = null;
    this.video1 = React.createRef();
    this.video2 = React.createRef();
    this.state = {
      clicked: false,
      videoId1: null,
      videoId2: null,
      currentVidElement: 1,
      currentMode: null,
      imageId: null,
      randomVidArr: [],
      randomImageArr: [],
      currentRandomIndex: 0,
    }
    this.renderVideoElements = this.renderVideoElements.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onEnded = this.onEnded.bind(this);
  }

  openWs = () => {
    this.ws = new WebSocket(config.socketEndpoint);
    // this.ws = new WebSocket("ws://67.205.170.55:8080");
    // TODO: establish socket
    this.ws.onopen = (event) => {
      console.log('connected');
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
        if (data.msgType === 'sendVideo') {
          this.processVideoMsg(data);
        }
        if (data.msgType === 'sendImage') {
          this.processImageMsg(data);
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

  processVideoMsg = (msg) => {
    const { videoId, mode, ...rest } = msg;
    switch (mode) {
      case 'all':
        this.playSingleVideo(msg.videoId);
        break;
      case 'chase':
        this.setState({
          currentMode: 'chase'
        });
        this.playSingleVideo(msg.videoIds);
        break;
      case 'random':
        this.playRandomVideos(msg.videoIds);
        break;
      default:
        break;
    }
  }

  processImageMsg = (msg) => {
    const { imageIds, mode, imageDuration, ...rest } = msg;
    switch (mode) {
      case 'chase':
        this.setState({
          imageId: imageIds,
          currentMode: 'chaseImage',
        }, () => {
          setTimeout(() => {
            if (this.state.currentMode === 'chaseImage') {
              this.setState({
                currentMode: null,
              });
            }
          }, imageDuration)
        })
        break;
      case 'random':
        this.playRandomImages(msg.imageIds, imageDuration);
        break;
      default:
        break;
    }
  }

  handleStartClick = () => {
    this.setState({
      clicked: true,
    })
  }

  playRandomVideos = (ids) => {
    const idsArr = ids.split(',');
    const nextVidElement = this.state.currentVidElement === 1 ? 2 : 1;
    this.setState({
      currentMode: 'random',
      currentRandomIndex: 0,
      randomVidArr: idsArr,
      [`videoId${nextVidElement}`]: idsArr[0],
      currentVidElement: nextVidElement,
      // [`videoId2`]: idsArr[0],
    }, () => {
      const toRef = `video${nextVidElement}`;
      const element = this[toRef].current;
      element.play();
      // debugger;
    });
  }

  // TODO: should set a 'random instance id' so timeouts do not fire if another random image sequence is received
  // alternatively, clear the interval + timeout when new msg arrives

  playRandomImages = (ids, imageDuration) => {
    clearTimeout(this.randomTimeout);
    clearInterval(this.randomInterval);
    const idsArr = ids.split(',');
    this.setState({
      currentMode: 'randomImage',
      currentRandomIndex: 0,
      randomImageArr: idsArr,
      imageId: idsArr[0],
    }, () => {
      this.randomInterval = setInterval(() => {
        if (this.state.currentMode === 'randomImage') {
          const nextIndex = this.state.currentRandomIndex + 1;
          const nextId = this.state.randomImageArr[nextIndex];
          this.setState({
            imageId: nextId,
            currentRandomIndex: nextIndex,
          })
        }
      }, imageDuration);
      this.randomTimeout = setTimeout(() => {
        clearInterval(this.randomInterval);
        if (this.state.currentMode === 'randomImage') {
          this.setState({
            currentMode: null,
          });
        }
      }, imageDuration * idsArr.length);
    });
  }

  playSingleVideo = (id) => {
    const nextVidElement = this.state.currentVidElement === 1 ? 2 : 1;
    this.setState({
      [`videoId${nextVidElement}`]: id,
      // [`videoId2`]: id,
      currentVidElement: nextVidElement,
    });
  }

  componentDidMount() {
    this.openWs();
  }

  onPlay = (currentVidElement) => {
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

  onEnded = (elementNumber) => {
    console.log('ended')
    if (this.state.currentVidElement === elementNumber) {
      const { currentMode } = this.state;
      if (currentMode === 'random' &&
          (this.state.currentRandomIndex < this.state.randomVidArr.length - 1)
          ) {
            console.log('in array of random, go to next')
            // in array of random, go to next
            const nextVidElement = this.state.currentVidElement === 1 ? 2 : 1;
            const nextIndex = this.state.currentRandomIndex + 1;
            const nextId = this.state.randomVidArr[nextIndex];
            this.setState({
              [`videoId${nextVidElement}`]: nextId,
              currentRandomIndex: nextIndex,
              currentVidElement: nextVidElement,
            });
            return
          }
      // TODO: handle varying ending cases
      this.setState({
        videoId1: null,
        videoId2: null,
      });
    }
  }

  renderVideoElements = () => {
    return (
      <div>
        {
        // this.state.videoId1 && 
        <video ref={this.video1}
          style={{ display: this.state.currentVidElement === 1 ? 'block' : 'none'}}
          // src={`http://67.205.170.55:8080/${this.state.videoId1}.mp4`}
          // src={`http://localhost:3000/${this.state.videoId1}.mp4`}
          src={`${config.filesPath}/${this.state.videoId1}.mp4`}
          onPlay={() => {this.onPlay(1)}}
          onEnded={() => {this.onEnded(1)}}
          autoPlay muted
        />}
        {
          // this.state.videoId2 &&
          <video ref={this.video2}
          style={{ display: this.state.currentVidElement === 2 ? 'block' : 'none'}}
          // src={`http://67.205.170.55:8080/${this.state.videoId2}.mp4`}
          src={`${config.filesPath}/${this.state.videoId2}.mp4`}
          onPlay={() => {this.onPlay(2)}}
          onEnded={() => {this.onEnded(2)}}
          autoPlay muted
        />}
      </div>
    )
  }

  renderImage = () => {
    return (
      <img
        className="image"
        src={`${config.filesPath}/images/${this.state.imageId}.jpg`}
      />
    )
  }

  render() {
    // if (!this.state.clicked) {
    //   return (
    //   <div
    //     className="clicker"
    //     onClick={this.handleStartClick}
    //   >
    //     <h1>click to start</h1>
    //   </div>)
    // }
    return (
      <div className="client">
        {(this.state.currentMode === 'chase' || this.state.currentMode === 'random') && (this.state.videoId1 || this.state.videoId2) && this.renderVideoElements()}
        {(this.state.currentMode === 'chaseImage' || this.state.currentMode === 'randomImage') && this.state.imageId && this.renderImage()}
      </div>
    );
  }
}

export default Client;
