const { matchUsers } = require('../services/match');

let connectedUsers = []; // Users who are online
let waitingUsers = [];   // Users who are in the queue, waiting for a match
let matches = {};        // Active matches (socket.id -> partner's socket.id)

/**
 * Handles user connection by adding the user to the connected users list only when they click "Start Chat"
 * @param {Object} socket - The socket object representing the user connection.
 * @param {Object} io - The socket.io object for communication.
 */
const handleUserConnection = (socket, io) => {
    if (!connectedUsers.some(user => user.id === socket.id)) {
        connectedUsers.push(socket); 
        io.emit('user-online', connectedUsers.length);
    }

    // Handle the user clicking "Start Chat"
    socket.on('start-match', () => {
        if (!waitingUsers.some(user => user.id === socket.id)) {
            waitingUsers.push(socket);  // Add the user to the waiting queue
        }

        // Match users when there are at least two available in the queue
        if (waitingUsers.length >= 2) {
            const user1 = waitingUsers.shift();  // Get the first user from the queue
            const user2 = waitingUsers.shift();  // Get the second user from the queue

            matchUsers(user1, user2, matches);  
        }
    });

    // Handle the user sending a message
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

/**
 * Handles user disconnection by removing them from the connected users list and cleaning up matches.
 * @param {Object} socket - The socket object representing the user connection.
 * @param {Object} io - The socket.io object for communication.
 */
const handleUserDisconnection = (socket, io) => {
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Remove from matches if the user is currently in a match
        const partnerId = matches[socket.id];
        if (partnerId) {
            const partnerSocket = io.sockets.sockets.get(partnerId);
            if (partnerSocket) {
                partnerSocket.emit('partnerDisconnected'); // Notify partner of disconnection
            }

            // Clean up matches
            delete matches[socket.id];
            delete matches[partnerId];
        }

        // Remove the user from the connected users list
        connectedUsers = connectedUsers.filter(user => user.id !== socket.id);
        // Remove the user from the waiting queue if they were in it
        waitingUsers = waitingUsers.filter(user => user.id !== socket.id);

        io.emit('user-online', connectedUsers.length); // Update online users count
    });
};

module.exports = {
    handleUserConnection,
    handleUserDisconnection
};
