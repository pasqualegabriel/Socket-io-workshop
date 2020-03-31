/* eslint-disable no-param-reassign */
const users = [];

exports.addUser = ({ id, name, room }) => {
  if(!name || !room) return { error: 'Username and room are required.' };

  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existingUser = users.find((user) => user.room === room && user.name === name);

  if(existingUser) return { error: 'Username is taken.' };

  const user = { id, name, room, typing: false };

  users.push(user);

  return { user };
};

exports.removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if(index !== -1) return users.splice(index, 1)[0];
};

exports.getUser = (id) => users.find((user) => user.id === id);

exports.getUsersInRoom = (room) => users.filter((user) => user.room === room);

exports.typing = (room) => users.filter((user) => user.room === room && user.typing);

exports.startTyping = (id) => {
  const index = users.findIndex((user) => user.id === id);
  users[index].typing = true;
};

exports.stopTyping = (id) => {
  const index = users.findIndex((user) => user.id === id);
  users[index].typing = false;
};
