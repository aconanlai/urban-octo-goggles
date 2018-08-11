const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');
const uuid = require('uuid/v4');
const osc = require('osc');
// const simulateLatency = require('express-simulate-latency');

const logger = require('./logger');
const msgTypes = require('./msgTypes');
const oscConverterFactory = require('./oscConverter');

const app = express();

const server = http.createServer(app);

// const smallLag = simulateLatency({ min: 500, max: 500 });
// app.use(smallLag);

const wss = new WebSocket.Server({ server });

const connections = {
};

let controller;

const msgProcessor = msgTypes(connections);
const oscConverter = oscConverterFactory();

wss.on('connection', (ws) => {
  console.log('connected');
  const id = uuid();
  ws.id = id;
  connections[id] = ws;
  sendClientsList();
  ws.on('message', function incoming(data) {
    const msg = JSON.parse(data);
    switch (msg.msgType) {
      case 'sendVideo':
        logger.info(`sendVideo received: ${JSON.stringify(msg)}`);
        msgProcessor.process(msg);
        break;
      case 'sendImage':
        logger.info(`sendImage received: ${JSON.stringify(msg)}`);
        msgProcessor.processImage(msg);
        break;
      case 'registerController':
        controller = ws;
        delete connections[ws.id];
        sendClientsList();
        break;
      default:
        break;
    }
  });

  ws.on('close', function close() {
    delete connections[ws.id];
    sendClientsList();
  });
});

function sendClientsList() {
  if (controller && controller.readyState === WebSocket.OPEN) {
    controller.send(JSON.stringify({
      msgType: 'clientList',
      clientList: Object.keys(connections),
    }));
  }
}

app.use(express.static(__dirname + '/build/build', {
  maxage: 86400000,
}));
app.get('*', (req, res) => res.sendFile(path.join(__dirname + '/build/build/index.html')));

// start our server
server.listen(process.env.PORT || 8080, () => {
  logger.info('Server started');
});

// Create an osc.js UDP Port listening on port 57121.
var udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 57121,
  metadata: true
});

// Listen for incoming OSC bundles.
udpPort.on("message", function (oscMsg) {
  const msg = oscConverter(oscMsg);
  if (msg) {
    switch (msg.msgType) {
      case 'sendVideo':
        logger.info(`sendVideo received via udp: ${JSON.stringify(msg)}`);
        msgProcessor.process(msg);
        break;
      case 'sendImage':
        logger.info(`sendImage received via udp: ${JSON.stringify(msg)}`);
        msgProcessor.processImage(msg);
        break;
      default:
        break;
    }
  }
});

// Open the socket.
udpPort.open();

process
  .on('unhandledRejection', (reason, p) => {
    logger.error(`unhandledRejection: reason: ${reason} - p: ${p}`);
    process.exit(1);
  })
  .on('uncaughtException', err => {
    logger.error(`unhandledRejection: err: ${err}`);
    console.log(err);
    process.exit(1);
  });
