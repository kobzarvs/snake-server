// const http = require('http');
// const socketio = require('socket.io');
const express = require('express');
const {ExpressPeerServer} = require('peer');

const PORT = process.env.PORT;

const app = express();
app.enable('trust proxy');

// const server = http.Server(app);
// const io = socketio(server);
// io.sockets.on('connection', (socket) => {
//   console.log(socket);
// });

const clients = new Map();

app.use(express.static('public'));

const server = app.listen(PORT, '0.0.0.0',() => {
  console.log(`App listening on port http://${server.address().address}:${server.address().port}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;

const peerServer = ExpressPeerServer(server, {
  allow_discovery: true,
});

peerServer
  .on('connection', (client) => {
    console.log('connectin', client.getId());
    for(let c of clients.values()) {
      c.send({type: 'SNAKE/ADD_PEER', payload: client.getId()});
    }
    clients.set(client.getId(), client);
  })
  .on('disconnect', (client) => {
    console.log('disconnect', client.getId());
    clients.delete(client.getId());
    for(let c of clients.values()) {
      c.send({type: 'SNAKE/REMOVE_PEER', payload: client.getId()});
    }
  })
  .on('message', (client, message) => {
    console.log('message', message);
  })
  .on('error', (error) => {
    console.error('error', error);
  })

app.use(peerServer);
