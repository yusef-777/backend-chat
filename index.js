// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const matchController = require('./controllers/mainController');
const disconnectController = require('./controllers/mainController');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Enable CORS
app.use(cors());

// Set up socket.io connections
io.on('connection', (socket) => {

  console.log("connected", socket.id);

  matchController.handleUserConnection(socket, io);
  disconnectController.handleUserDisconnection(socket, io);
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



