import config from '../config.js';

export class AssetCacher {
  constructor() {
    this.videos = {};
    this.images = {};
  }

  preloadImages = async (imgIdArray) => {
    const promises = imgIdArray.map((imgId) => {
      return new Promise((resolve) => {
        if (!this.images[imgId]) {
          const img = new Image();
          img.onload = () => {
            this.images[imgId] = true;
            resolve();
          }
          img.src = `${config.filesPath}/images/${imgId}.jpg`;
        } else {
          resolve();
        }
      })
    })
    return await Promise.all(promises);
  }

  preloadVideos = (videoIdArray) => {
    const [first, ...rest] = videoIdArray;
    const restPromises = rest.map((videoId) => {
      return this.fetchVideo(videoId);
    });
    Promise.all(restPromises);
    return this.fetchVideo(first);
  }

  fetchVideo = (videoId) => {
    return new Promise((resolve) => {
      if (this.videos[videoId]) {
        resolve();
      }
      var req = new XMLHttpRequest();
      req.open('GET', `${config.filesPath}/${videoId}.jpg`, true);
      req.responseType = 'blob';
  
      req.onload = () => {
        if (this.status === 200) {
          this.videos[videoId] = true;
        }
        resolve();
      }
      req.onerror = () => {
        resolve();
      }
      req.send();
    })
  }
}
