const utils = require('./utils');
const WebSocket = require('ws');

module.exports = (connections) => {
  const types = {
    /**
    * send to all users
    * @param {string} msg.videoId
    */
    sendToAll: (msg) => {
      console.log('sending to all');
      sendToClients(Object.values(connections), msg);
    },

    /**
    * send to one user
    * @param {string} msg.videoId
    * @param {string} msg.recipient - socket id of recipient
    */
    sendToOne: (msg) => {
      console.log('sending to one');
      const client = connections[msg.recipient];
      sendToClients([client], msg);
    },

    /**
    * send to random user(s)
    * @param {Array<string>} msg.videoIds
    * @param {number} msg.percentage
    */
    sendToRandom: (msg) => {
      const percentage = Number(msg.percentage);
      console.log('************');
      console.log(percentage);
      const clients = utils.getRandomPercentage(Object.values(connections), percentage);
      console.log(`sending random mode to ${percentage}% of users (${clients.length} users) with videos: ${msg.videoIds}`);
      sendToClients(clients, msg);
    },
  };

  return {
    /**
     * process video msg
     * @param {string} msg.mode
     * @param {string} msg.videoId
     */
    process: (msg) => {
      switch (msg.mode) {
        case 'single':
          return types.sendToOne(msg);
        case 'all':
          return types.sendToAll(msg);
        case 'random':
          return types.sendToRandom(msg);
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
