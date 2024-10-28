const { matchUsers } = require('../services/match');
let connectedUsers = [];
let waitingUsers = [];
let matches = {};

const handleUserConnection = (socket, io) => {
  if (!connectedUsers.some(user => user.id === socket.id)) {
    connectedUsers.push(socket);
    io.emit('user-online', connectedUsers.length);
  }

  socket.on('start-match', () => {
    if (!waitingUsers.some(user => user.id === socket.id)) {
      waitingUsers.push(socket);
    }

    if (waitingUsers.length >= 2) {
      const user1 = waitingUsers.shift();
      const user2 = waitingUsers.shift();
      matchUsers(user1, user2, matches);
    }
  });

  socket.on('send-message', (message) => {
    const partnerId = matches[socket.id];
    if (partnerId) {
      const partnerSocket = io.sockets.sockets.get(partnerId);
      if (partnerSocket) {
        partnerSocket.emit('receive-message', message);
      }
    }
  });
};

const handleUserDisconnection = (socket, io) => {
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const partnerId = matches[socket.id];
    if (partnerId) {
      const partnerSocket = io.sockets.sockets.get(partnerId);
      if (partnerSocket) {
        partnerSocket.emit('partnerDisconnected');
      }
      delete matches[socket.id];
      delete matches[partnerId];
    }

    connectedUsers = connectedUsers.filter(user => user.id !== socket.id);
    waitingUsers = waitingUsers.filter(user => user.id !== socket.id);
    io.emit('user-online', connectedUsers.length);
  });
};

module.exports = { handleUserConnection, handleUserDisconnection };
