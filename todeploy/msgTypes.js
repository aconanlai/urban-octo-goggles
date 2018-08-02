const utils = require('./utils');
const videos = require('./videos');
const WebSocket = require('ws');

const logger = require('./logger');

module.exports = (connections) => {
  const types = {
    /**
    * send to all users
    * @param {string} msg.videoId
    */
    sendToAll: (msg) => {
      sendToClients(Object.values(connections), msg);
    },

    /**
    * send to one user
    * @param {string} msg.videoId
    * @param {string} msg.recipient - socket id of recipient
    */
    sendToOne: (msg) => {
      const client = connections[msg.recipient];
      sendToClients([client], msg);
    },

    /**
    * send to random user(s)
    * @param {string} msg.videoIds - actually single videoId
    * @param {number} msg.percentage
    * @param {number} msg.interval
    */
    sendChase: (msg) => {
      const { percentage, videoIds } = msg;
      if (!percentage || !videoIds) {
        logger.error('incorrect params when sending chase video');
        return;
      }
      const realPercentage = Number(percentage);
      const clients = utils.getRandomPercentage(Object.values(connections), realPercentage);
      logger.info(`sending chase mode to ${percentage}% of users (${clients.length} users) with video: ${msg.videoIds}`);
      const videoLength = videos[videoIds].length;
      for (let i = 0; i < clients.length; i += 1) {
        const toWait = msg.interval ? msg.interval * i : videoLength * i;
        // console.log(`setting timeout for user ${i} of ${toWait} ms`);
        setTimeout(() => {
          sendToClient(clients[i], msg);
        }, toWait);
      }
    },

    /**
    * send to random user(s)
    * @param {Array<string>} msg.videoIds
    * @param {number} msg.percentage
    */
    sendToRandom: (msg) => {
      const { percentage, videoIds } = msg;
      if (!percentage || !videoIds) {
        logger.error('incorrect params when sending random video');
        return;
      }
      const realPercentage = Number(percentage);
      const clients = utils.getRandomPercentage(Object.values(connections), realPercentage);
      logger.info(`sending random mode to ${percentage}% of users (${clients.length} users) with videos: ${msg.videoIds}`);
      sendToClients(clients, msg);
    },

    /**
    * send image to random user(s)
    * @param {string} msg.imageIds - actually single videoId
    * @param {number} msg.percentage
    * @param {number} msg.interval
    * @param {number} msg.imageDuration
    */
    sendImageChase: (msg) => {
      const { percentage, imageIds, interval, imageDuration } = msg;
      if (!percentage || !imageIds || !imageDuration) {
        logger.error('incorrect params when sending random video');
        return;
      }
      const realPercentage = Number(msg.percentage);
      const clients = utils.getRandomPercentage(Object.values(connections), realPercentage);
      logger.info(`sending chase mode to ${percentage}% of users (${clients.length} users) with image: ${msg.imageIds}`);
      for (let i = 0; i < clients.length; i += 1) {
        const toWait = interval * i;
        // console.log(`setting timeout for user ${i} of ${toWait} ms`);
        setTimeout(() => {
          sendToClient(clients[i], msg);
        }, toWait);
      }
    },

    /**
    * send images to random user(s)
    * @param {Array<string>} msg.imageIds
    * @param {number} msg.percentage
    */
    sendImageToRandom: (msg) => {
      const { percentage, imageIds, imageDuration } = msg;
      if (!percentage || !imageIds || !imageDuration) {
        logger.error('incorrect params when sending random video');
        return;
      }
      const realPercentage = Number(msg.percentage);
      const clients = utils.getRandomPercentage(Object.values(connections), realPercentage);
      logger.info(`sending random mode to ${percentage}% of users (${clients.length} users) with images: ${msg.imageIds}`);
      sendToClients(clients, msg);
    },
  };

  return {
    /**
     * process video msg
     * @param {string} msg.mode
     * @param {string} msg.videoIds
     */
    process: (msg) => {
      switch (msg.mode) {
        case 'all':
          return types.sendToAll(msg);
        case 'random':
          return types.sendToRandom(msg);
        case 'chase':
          return types.sendChase(msg);
        default:
          break;
      }
    },

    /**
     * process image msg
     * @param {string} msg.mode
     * @param {string} msg.imageIds
     */
    processImage: (msg) => {
      switch (msg.mode) {
        case 'random':
          return types.sendImageToRandom(msg);
        case 'chase':
          return types.sendImageChase(msg);
        default:
          break;
      }
    },
  };
};

/**
  * helper to send to x clients
  * @param {Array<connection>} clients
  * @param {Message} msg
  */
function sendToClients(clients, msg) {
  clients.forEach(function each(client, i) {
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
}

/**
  * helper to send to 1 client
  * @param {connection} client
  * @param {Message} msg
  */
function sendToClient(client, msg) {
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(msg));
  }
}
