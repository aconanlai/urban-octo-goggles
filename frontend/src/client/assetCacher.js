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
        }
        resolve();
      })
    })
    return await Promise.all(promises);
  }

  preloadVideos = (videoIdArray) => {
    // TODO
    // http://dinbror.dk/blog/how-to-preload-entire-html5-video-before-play-solved/
  }
}