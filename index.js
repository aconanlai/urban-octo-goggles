const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');
const uuid = require('uuid/v4');

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const connections = {
};

let controller;

wss.on('connection', (ws) => {
  const id = uuid();
  ws.id = id;
  connections[id] = ws;
  sendClientsList();
  ws.on('message', function incoming(data) {
    const msg = JSON.parse(data);
    console.log(msg.msgType);
    switch (msg.msgType) {
      case 'sendVideo':
        const now = new Date().getTime();
        const msgWithTime = {
          ...msg,
          serverReceived: now,
        };
        if (msg.recipient === 'all') {
          sendToAll(msgWithTime);
        } else {
          sendToOne(msgWithTime);
        }
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

function sendToAll(msg) {
  console.log('sending to all')
  Object.values(connections).forEach(function each(client, i) {
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
}

function sendToOne(msg) {
  console.log('sending to one');
  const client = connections[msg.recipient];
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(msg));
  }
}

function sendClientsList() {
  if (controller && controller.readyState === WebSocket.OPEN) {
    controller.send(JSON.stringify({
      msgType: 'clientList',
      clientList: Object.keys(connections),
    }));
  }
}


app.get('/test', (req, res) => res.send('test'));
app.use(express.static(__dirname + '/build'));
app.get('*', (req, res) => res.sendFile(path.join(__dirname+'/build/index.html')));

// start our server
server.listen(process.env.PORT || 8080, () => {
  console.log(`Server started on port ${server.address().port} :)`);
});
