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
      currentMode: 'chaseImage',
      imageId: 'apples',
      randomVidArr: [],
      randomImageArr: [],
      currentRandomIndex: 0,
      randomDuration: 100,
    }
    this.renderVideoElements = this.renderVideoElements.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onEnded = this.onEnded.bind(this);
    this.playNextRandomMedia = this.playNextRandomMedia.bind(this);
    this.handleVideoPlay = this.handleVideoPlay.bind(this);
  }

  openWs = () => {
    this.ws = new WebSocket(config.socketEndpoint);
    this.ws.onopen = (event) => {
      console.log('connected');
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
        if (data.msgType === 'sendVideo' && this.imageOnlyMode !== true) {
          this.processVideoMsg(data);
        }
        if (data.msgType === 'sendImage') {
          this.processImageMsg(data);
        }
        if (data.msgType === 'sendKill') {
          this.clearRandomImageTimeout();
          this.setState({
            currentMode: null,
          })
        }
      }
    };
    this.ws.onclose = () => {
      const waitTime = Math.floor(Math.random() * 8000);
      setTimeout(() => {
        console.log('ws closed, auto re-connecting');
        this.openWs();
      }, waitTime);
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

  playRandomVideos = async (ids) => {
    const idsArr = ids.split(',');
    await this.assetCacher.preloadVideos(idsArr);
    const nextVidElement = this.state.currentVidElement === 1 ? 2 : 1;
    this.setState({
      currentMode: 'random',
      currentRandomIndex: 0,
      randomVidArr: idsArr,
      [`videoId${nextVidElement}`]: idsArr[Math.floor(Math.random() * idsArr.length)],
      currentVidElement: nextVidElement,
    }, () => {
      const toRef = `video${nextVidElement}`;
      const element = this[toRef].current;
      this.handleVideoPlay(element);
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

  handleVideoPlay = (videoElement) => {
    const playPromise = videoElement.play();

    // In browsers that don’t yet support this functionality,
    // playPromise won’t be defined.
    if (playPromise !== undefined && this.checkedVideoAutoplay !== true) {
      playPromise.then(() => {
        this.checkedVideoAutoplay = true;
      }).catch((error) => {
        console.log(error);
        this.checkedVideoAutoplay = true;
        this.imageOnlyMode = true;
      });
    }
  }

  playSingleVideo = (id) => {
    const nextVidElement = this.state.currentVidElement === 1 ? 2 : 1;
    this.setState({
      [`videoId${nextVidElement}`]: id,
      // [`videoId2`]: id,
      currentVidElement: nextVidElement,
    }, () => {
      const toRef = `video${nextVidElement}`;
      const element = this[toRef].current;
      this.handleVideoPlay(element);
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
    const otherId = currentVidElement === 1 ? 2 : 1;
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
        }, () => {
          // need to do this if 'next' video is same as 'previous' video so element still has it loaded on the last frame
          const toRef = `video${nextVidElement}`;
          const element = this[toRef].current;
          this.handleVideoPlay(element);
          this.setState({
            currentVidElement: nextVidElement,
          })
        });
        return
      } else if (currentMode === 'chase') {
        this.clearRandomImageTimeout();
        this.setState({
          currentMode: null,
        })
      }
      // TODO: handle varying ending cases
      // this.setState({
      //   videoId1: null,
      //   videoId2: null,
      // });
    }
  }

  renderVideoElements = () => {
    const src1 = this.state.videoId1 ? `${config.filesPath}/${this.state.videoId1}.mp4` : null;
    const src2 = this.state.videoId2 ? `${config.filesPath}/${this.state.videoId2}.mp4` : null;
    return (
      <div className="videoContainer">
        {
          // this.state.videoId1 && 
          <video ref={this.video1}
            style={{ display: (this.state.currentMode === 'chase' || this.state.currentMode === 'random') && this.state.currentVidElement === 1 ? 'block' : 'none' }}
            // src={`http://67.205.170.55:8080/${this.state.videoId1}.mp4`}
            // src={`http://localhost:3000/${this.state.videoId1}.mp4`}
            src={src1}
            onPlay={() => { this.onPlay(1) }}
            onEnded={() => { this.onEnded(1) }}
            muted
          />
        }
        {
          // this.state.videoId2 &&
          <video ref={this.video2}
            style={{ display: (this.state.currentMode === 'chase' || this.state.currentMode === 'random') && this.state.currentVidElement === 2 ? 'block' : 'none' }}
            // src={`http://67.205.170.55:8080/${this.state.videoId2}.mp4`}
            src={src2}
            onPlay={() => { this.onPlay(2) }}
            onEnded={() => { this.onEnded(2) }}
            muted
          />
        }
      </div>
    )
  }

  renderImage = () => {
    const display = (this.state.currentMode === 'chaseImage' || this.state.currentMode === 'randomImage') && this.state.imageId
      ? 'block' : 'none';
    console.log(display);
    const src = this.state.imageId ? `${config.filesPath}/images/${this.state.imageId}.jpg` : null;
    return (
      <img
        style={{ display }}
        className="image"
        src={src}
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
        {this.renderVideoElements()}
        {this.renderImage()}
      </div>
    );
  }
}

export default Client;
