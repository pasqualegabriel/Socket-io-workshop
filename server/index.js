const express = require('express');
const socketio = require('socket.io');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
const router = require('./router');

const app = express();

app.set('port', process.env.PORT || 8001)
app.use(router);

const server = app.listen(app.get('port'), () => console.log(`Server has started on port ${app.get('port')}`));
const io = socketio(server);

io.on('connect', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    const { error } = addUser({ id: socket.id, name, room });

    if(error) return callback(error);

    socket.join(room);

    socket.emit('message', { user: 'admin', text: `${name}, welcome to room ${room}.`});
    socket.broadcast.to(room).emit('message', { user: 'admin', text: `${name} has joined!` });

    io.to(room).emit('roomData', { room: room, users: getUsersInRoom(room) });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });

  socket.on('typing', (data) => {
    socket.broadcast.to(data.room).emit('typing', data);
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
  });
});
