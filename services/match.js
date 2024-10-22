
/**
 * Matches two users together by emitting a 'match' event to each with the other's
 * socket ID and storing the match in the 'matches' object.
 * @param {Object} user1 - The first user to be matched.
 * @param {Object} user2 - The second user to be matched.
 * @param {Object} matches - The object to store the match in.
 */
const matchUsers = (user1, user2, matches) => {
    matches[user1.id] = user2.id;
    matches[user2.id] = user1.id;
    
    user1.emit('match', { partnerId: user2.id });
    user2.emit('match', { partnerId: user1.id });

    console.log("matched", user1.id, user2.id);
    
};

module.exports = {
    matchUsers
}