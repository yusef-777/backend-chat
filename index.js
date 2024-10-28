const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { handleUserConnection, handleUserDisconnection } = require('./controllers/mainController');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors());

io.on('connection', (socket) => {
  console.log("connected", socket.id);
  handleUserConnection(socket, io);
  handleUserDisconnection(socket, io);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
