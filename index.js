const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');
const uuid = require('uuid/v4');

const msgTypes = require('./msgTypes');

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const connections = {
};

let controller;

const msgProcessor = msgTypes(connections);

wss.on('connection', (ws) => {
  const id = uuid();
  ws.id = id;
  connections[id] = ws;
  sendClientsList();
  ws.on('message', function incoming(data) {
    const msg = JSON.parse(data);
    console.log(msg);
    switch (msg.msgType) {
      case 'sendVideo':
        msgProcessor.process(msg);
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
    // console.log(connections);
    controller.send(JSON.stringify({
      msgType: 'clientList',
      clientList: Object.keys(connections),
    }));
  }
}

app.get('/test', (req, res) => res.send('test'));
app.use(express.static(__dirname + '/build/build'));
app.get('*', (req, res) => res.sendFile(path.join(__dirname+'/build/build/index.html')));

// start our server
server.listen(process.env.PORT || 8080, () => {
  console.log(`Server started on port ${server.address().port} :)`);
});
