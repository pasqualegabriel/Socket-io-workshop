const users = [];

exports.getUser = (name, room) => users.find(user => user.name === name && user.room === room);

exports.getUserById = id => users.find(user => user.id === id);

exports.addUser = user => users.push(user);

exports.removeUser = id => {
  const index = users.findIndex(user => user.id === id);
  if(index !== -1) return users.splice(index, 1)[0];
};

exports.getUsersInRoom = room => users.filter(user => user.room === room);
