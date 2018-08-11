import React, { Component } from 'react';
import config from '../config.js';
import { AssetCacher } from './assetCacher'

import './client.css';

class Client extends Component {
  constructor(props) {
    super(props);
    this.assetCacher = new AssetCacher();
    this.randomTimeoutInterval = null;
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
      randomDuration: 100,
    }
    this.renderVideoElements = this.renderVideoElements.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onEnded = this.onEnded.bind(this);
    this.playNextRandomMedia = this.playNextRandomMedia.bind(this);
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
        if (data.msgType === 'sendKill') {
          this.setState({
            currentMode: null,
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

  processVideoMsg = (msg) => {
    const { videoId, mode, ...rest } = msg;
    switch (mode) {
      case 'chase':
        this.setState({
          currentMode: 'chase'
        });
        this.playSingleVideo(msg.videoIds);
        this.clearRandomImageTimeout();
        break;
      case 'random':
        this.playRandomVideos(msg.videoIds);
        this.clearRandomImageTimeout();
        break;
      default:
        break;
    }
  }

  processImageMsg = (msg) => {
    const { imageIds, mode, imageDuration, ...rest } = msg;
    switch (mode) {
      case 'chase':
        this.clearRandomImageTimeout();
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
      [`videoId${nextVidElement}`]: idsArr[Math.floor(Math.random() * idsArr.length)],
      currentVidElement: nextVidElement,
      // [`videoId2`]: idsArr[0],
    }, () => {
      const toRef = `video${nextVidElement}`;
      const element = this[toRef].current;
      element.play();
      // debugger;
    });
  }

  clearRandomImageTimeout = () => {
    clearTimeout(this.randomTimeout);
    this.randomTimeout = null;
  }

  // TODO: this can be adapted for videos if we ever move off the onEnd solution...
  playNextRandomMedia = () => {
    if (this.state.currentMode === 'randomImage') {
      const indicesArr = Array.apply(null, { length: this.state.randomImageArr.length }).map(Number.call, Number);
      if (indicesArr.length > 1) {
        indicesArr.splice(this.state.currentRandomIndex, 1);
      }
      var randomIndex = indicesArr[Math.floor(Math.random() * indicesArr.length)];
      const nextId = this.state.randomImageArr[randomIndex];
      this.setState({
        imageId: nextId,
        currentRandomIndex: randomIndex,
      }, () => {
        this.randomTimeout = setTimeout(this.playNextRandomMedia, this.state.randomDuration);
      })
    } else if (this.state.currentMode === 'randomVideo') {
      // TODO
    }
  }

  // TODO: set this.randomTimeout = null when clearing timeOut
  playRandomImages = async (ids, randomDuration) => {
    const idsArr = ids.split(',');
    await this.assetCacher.preloadImages(idsArr);
    console.log('image preloading complete')
    this.setState({
      randomDuration,
      currentMode: 'randomImage',
      currentRandomIndex: 0,
      randomImageArr: idsArr,
    }, () => {
      if (!this.randomTimeout) {
        this.playNextRandomMedia();
      }
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

  // TODO: test all of this with very short videos
  onEnded = (elementNumber) => {
    console.log('ended')
    if (this.state.currentVidElement === elementNumber) {
      const { currentMode } = this.state;
      if (currentMode === 'random' 
          // && (this.state.currentRandomIndex < this.state.randomVidArr.length - 1)
          ) {
            console.log('in array of random, go to next')
            // in array of random, go to next
            let nextIndex;
            if (this.state.randomVidArr.length > 1) {
              const indicesArr = Array.apply(null, { length: this.state.randomVidArr.length }).map(Number.call, Number);
              indicesArr.splice(this.state.currentRandomIndex, 1);
              nextIndex = indicesArr[Math.floor(Math.random() * indicesArr.length)];
            } else {
              nextIndex = this.state.currentRandomIndex;
            }
            const nextId = this.state.randomVidArr[nextIndex];
            const nextVidElement = this.state.currentVidElement === 1 ? 2 : 1;
            // const nextIndex = this.state.currentRandomIndex + 1;
            // const nextId = this.state.randomVidArr[nextIndex];
            this.setState({
              [`videoId${nextVidElement}`]: nextId,
              currentRandomIndex: nextIndex,
              currentVidElement: nextVidElement,
            }, () => {
              // need to do this if 'next' video is same as 'previous' video so element still has it loaded on the last frame
              const toRef = `video${nextVidElement}`;
              const element = this[toRef].current;
              element.play();
            });
            return
          }
      // TODO: handle varying ending cases
      // this.setState({
      //   videoId1: null,
      //   videoId2: null,
      // });
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
        // src={this.assetCacher.images[this.state.imageId]}
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
