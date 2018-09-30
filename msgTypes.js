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
      const videoLength = 100;
      for (let i = 0; i < clients.length; i += 1) {
        const toWait = msg.interval ? msg.interval * i : videoLength * i;
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

    /**
    * send images to random user(s) by segment
    * @param {string} msgType - like sendImage
    * @param {Array<Array<string>>} msg.segmentContents
    * @param {Array<number>} msg.segmentSizes
    */
    sendToRandomSegmented: (msg, msgType) => {
      const { segmentContents, segmentSizes, imageDuration } = msg;
      if (!segmentContents || !segmentSizes) {
        logger.error('incorrect params when sending random media by segments');
        return;
      }
      const totalPercentage = segmentSizes.reduce((acc, val) => {
        return acc + val;
      }, 0);
      const totalClients = utils.getRandomPercentage(Object.values(connections), totalPercentage);
      let lastCounter = 0;
      for (let i = 0; i < segmentSizes.length; i += 1) {
        const percentageOfWhole = segmentSizes[i] / totalPercentage;
        const realNumberOfClients = Math.floor(totalClients.length * percentageOfWhole);
        const toSend = totalClients.slice(lastCounter, lastCounter + realNumberOfClients);
        lastCounter += realNumberOfClients;
        const mediaIdPropertyName = msgType === 'sendVideo' ? 'videoIds' : 'imageIds';
        sendToClients(toSend, {
          msgType,
          mode: 'random',
          [mediaIdPropertyName]: segmentContents[i].join(','),
          imageDuration,
        });
      }
    },

    /**
    * send images chase by segment
    * @param {Array<string>} msg.segmentContents
    * @param {Array<number>} msg.segmentSizes
    * @param {number} msg.interval
    */
    sendChaseImageSegmented: (msg) => {
      const { segmentContents, segmentSizes, imageDuration, interval } = msg;
      if (!segmentContents || !segmentSizes || !imageDuration || !interval) {
        logger.error('incorrect params when sending chase image by segments');
        return;
      }
      const totalPercentage = segmentSizes.reduce((acc, val) => {
        return acc + val;
      }, 0);
      const totalClients = utils.getRandomPercentage(Object.values(connections), totalPercentage);
      let lastCounter = 0;
      for (let i = 0; i < segmentSizes.length; i += 1) {
        const percentageOfWhole = segmentSizes[i] / totalPercentage;
        const realNumberOfClients = Math.floor(totalClients.length * percentageOfWhole);
        const toSend = totalClients.slice(lastCounter, lastCounter + realNumberOfClients);
        lastCounter += realNumberOfClients;
        for (let j = 0; j < toSend.length; j += 1) {
          const toWait = interval * j;
          setTimeout(() => {
            sendToClient(toSend[j], {
              msgType: 'sendImage',
              mode: 'chase',
              imageIds: segmentContents[i],
              imageDuration,
              interval,
            });
          }, toWait);
        }
      }
    },

    /**
    * send video chase by segment
    * @param {Array<string>} msg.segmentContents
    * @param {Array<number>} msg.segmentSizes
    * @param {number} msg.interval
    */
    sendChaseVideoSegmented: (msg) => {
      const { segmentContents, segmentSizes, interval } = msg;
      if (!segmentContents || !segmentSizes || !interval) {
        logger.error('incorrect params when sending chase video by segments');
        return;
      }
      const totalPercentage = segmentSizes.reduce((acc, val) => {
        return acc + val;
      }, 0);
      const totalClients = utils.getRandomPercentage(Object.values(connections), totalPercentage);
      let lastCounter = 0;
      for (let i = 0; i < segmentSizes.length; i += 1) {
        const percentageOfWhole = segmentSizes[i] / totalPercentage;
        const realNumberOfClients = Math.floor(totalClients.length * percentageOfWhole);
        const toSend = totalClients.slice(lastCounter, lastCounter + realNumberOfClients);
        lastCounter += realNumberOfClients;
        for (let j = 0; j < toSend.length; j += 1) {
          const toWait = interval * j;
          setTimeout(() => {
            sendToClient(toSend[j], {
              msgType: 'sendVideo',
              mode: 'chase',
              videoIds: segmentContents[i],
              interval,
            });
          }, toWait);
        }
      }
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
        case 'random':
          return types.sendToRandom(msg);
        case 'chase':
          return types.sendChase(msg);
        case 'randomSegmented':
          return types.sendToRandomSegmented(msg, 'sendVideo');
        case 'chaseSegmented':
          return types.sendChaseVideoSegmented(msg);
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
        case 'randomSegmented':
          return types.sendToRandomSegmented(msg, 'sendImage');
        case 'chaseSegmented':
          return types.sendChaseImageSegmented(msg);
        default:
          break;
      }
    },

    processKill: (msg) => {
      const { percentage } = msg;
      const realPercentage = Number(msg.percentage);
      const clients = utils.getRandomPercentage(Object.values(connections), realPercentage);
      logger.info(`sending kill msg to ${percentage}% of users (${clients.length} users)`);
      sendToClients(clients, msg);
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
