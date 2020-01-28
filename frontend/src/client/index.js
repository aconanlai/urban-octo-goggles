import React, { Component } from 'react';
import config from '../config.js';
import { AssetCacher } from './assetCacher'

import './client.css';

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(window.location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

class Client extends Component {
  constructor(props) {
    super(props);
    this.assetCacher = new AssetCacher();
    this.randomTimeoutInterval = null;
    this.video = React.createRef();
    this.video1 = React.createRef();
    this.video2 = React.createRef();
    this.state = {
      clicked: false,
      videoId: null,
      videoId1: null,
      videoId2: null,
      currentVidElement: 1,
      currentMode: 'chaseImage',
      imageId: 'land',
      randomVidArr: [],
      randomImageArr: [],
      currentRandomIndex: 0,
      randomDuration: 100,
      imageOnlyMode: false,
    }
    this.renderVideoElements = this.renderVideoElements.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onEnded = this.onEnded.bind(this);
    this.playNextRandomMedia = this.playNextRandomMedia.bind(this);
    this.handleVideoPlay = this.handleVideoPlay.bind(this);
    this.playNextSequenceImage = this.playNextSequenceImage.bind(this);
    this.playSequenceVideos = this.playSequenceVideos.bind(this);
    this.playSequenceImages = this.playSequenceImages.bind(this);
  }
  

  openWs = () => {
    this.ws = new WebSocket(config.socketEndpoint);
    this.ws.onopen = (event) => {
      const deviceid = getUrlParameter('deviceid')
      if (deviceid) {
        const msg = JSON.stringify({
          msgType: 'registerIpad',  
          deviceid,
        });
        this.ws.send(msg);
      }
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.msgType === 'sendVideo' && this.state.imageOnlyMode !== true) {
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
      case 'sequence':
        this.playSequenceVideos(msg.videoIds);
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
      case 'sequence':
        this.playSequenceImages(msg.imageIds, imageDuration);
        break;
      default:
        break;
    }
  }

  playRandomVideos = async (ids) => {
    const idsArr = ids.split(',');
    await this.assetCacher.preloadVideos(idsArr);
    this.setState({
      currentMode: 'random',
      currentRandomIndex: 0,
      randomVidArr: idsArr,
      videoId: idsArr[Math.floor(Math.random() * idsArr.length)],
    }, () => {
      const element = this.video.current;
      this.handleVideoPlay(element);
    });
  }

  playSequenceVideos = async (ids) => {
    const idsArr = ids.split(',');
    await this.assetCacher.preloadVideos(idsArr);
    this.setState({
      currentMode: 'sequence',
      currentSequenceIndex: 0,
      sequenceVidArr: idsArr,
      videoId: idsArr[0],
    }, () => {
      const element = this.video.current;
      this.handleVideoPlay(element);
    });
  }

  clearRandomImageTimeout = () => {
    clearTimeout(this.randomTimeout);
    this.randomTimeout = null;
    clearTimeout(this.sequenceTimeout);
    this.sequenceTimeout = null;
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

  playNextSequenceImage = () => {
    if (this.state.currentMode === 'sequenceImage') {
      const { sequenceImageArr, currentSequenceIndex } = this.state;
      const arrLength = sequenceImageArr.length;
      let nextIndex = currentSequenceIndex === arrLength - 1 ? 0 : currentSequenceIndex + 1;
      const nextId = sequenceImageArr[nextIndex];
      this.setState({
        imageId: nextId,
        currentSequenceIndex: nextIndex,
      }, () => {
        this.sequenceTimeout = setTimeout(this.playNextSequenceImage, this.state.sequenceDuration);
      })
    } else if (this.state.currentMode === 'randomVideo') {
      // TODO
    }
  }

  playRandomImages = async (ids, randomDuration) => {
    const idsArr = ids.split(',');
    await this.assetCacher.preloadImages(idsArr);
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

  playSequenceImages = async (ids, sequenceDuration) => {
    const idsArr = ids.split(',');
    await this.assetCacher.preloadImages(idsArr);
    this.setState({
      sequenceDuration,
      currentMode: 'sequenceImage',
      currentSequenceIndex: 0,
      sequenceImageArr: idsArr,
    }, () => {
      if (!this.sequenceTimeout) {
        this.playNextSequenceImage();
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
        this.checkedVideoAutoplay = true;
        this.setState({
          currentMode: null,
          imageOnlyMode: true,
        })
      });
    } else if (playPromise === undefined) {
      this.setState({
        currentMode: null,
        imageOnlyMode: true,
      })
    }
  }

  playSingleVideo = (id) => {
    this.setState({
      videoId: id,
    }, () => {
      const element = this.video.current;
      this.handleVideoPlay(element);
    });
  }

  componentDidMount() {
    this.openWs();
  }

  onPlay = (currentVidElement) => {
    this.setState({
      currentVidElement,
    });
    const otherId = currentVidElement === 1 ? 2 : 1;
    const toRef = `video${otherId}`;
    const element = this[toRef].current;
    element.pause();
  }

  onEnded = (elementNumber) => {
    if (this.state.currentMode === 'random'
    ) {
      let nextIndex;
      if (this.state.randomVidArr.length > 1) {
        const indicesArr = Array.apply(null, { length: this.state.randomVidArr.length }).map(Number.call, Number);
        indicesArr.splice(this.state.currentRandomIndex, 1);
        nextIndex = indicesArr[Math.floor(Math.random() * indicesArr.length)];
      } else {
        nextIndex = this.state.currentRandomIndex;
      }
      const nextId = this.state.randomVidArr[nextIndex];
      this.setState({
        videoId: nextId,
        currentRandomIndex: nextIndex,
      }, () => {
        const element = this.video.current;
        this.handleVideoPlay(element);
      });
      return;
    } else if (this.state.currentMode === 'chase') {
      this.clearRandomImageTimeout();
      this.setState({
        currentMode: null,
      })
    } else if (this.state.currentMode === 'sequence') {
      const { sequenceVidArr, currentSequenceIndex } = this.state;
      const arrLength = sequenceVidArr.length;
      let nextIndex = currentSequenceIndex === arrLength - 1 ? 0 : currentSequenceIndex + 1;
      const nextId = sequenceVidArr[nextIndex];
      this.setState({
        videoId: nextId,
        currentSequenceIndex: nextIndex,
      }, () => {
        const element = this.video.current;
        this.handleVideoPlay(element);
      });
    }
  }

  renderVideoElements = () => {
    const src = this.state.videoId ? `${config.filesPath}/videos/${this.state.videoId}.mp4` : null;
    return (
      <div className="videoContainer">
        {
          <video ref={this.video}
            style={{ display: (this.state.currentMode === 'chase' || this.state.currentMode === 'random'  || this.state.currentMode === 'sequence') ? 'block' : 'none' }}
            src={src}
            onEnded={() => { this.onEnded(1) }}
            muted
          />
        }
      </div>
    )
  }

  renderImage = () => {
    const display = (this.state.currentMode === 'chaseImage' || this.state.currentMode === 'randomImage' || this.state.currentMode === 'sequenceImage') && this.state.imageId
      ? 'block' : 'none';
    const src = this.state.imageId ? `${config.filesPath}/images/${this.state.imageId}.jpg` : null;
    return (
      <img
        style={{ display }}
        className="image"
        src={src}
      />
    )
  }

  render() {
    return (
      <div id="client" className="client">
        {!this.state.imageOnlyMode && this.renderVideoElements()}
        {this.renderImage()}
      </div>
    );
  }
}

export default Client;
