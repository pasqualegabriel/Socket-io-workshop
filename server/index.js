const express = require('express');
const socketio = require('socket.io');
const { addUser, removeUser, getUser, getUserById, getUsersInRoom } = require('./users');
const router = require('./router');

const app = express();

app.set('port', process.env.PORT || 8001)
app.use(router);

const server = app.listen(app.get('port'), () => console.log(`Server has started on port ${app.get('port')}`));
const io = socketio(server);

io.on('connect', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    if(!name || !room) return callback({ error: 'Username and room are required.' });

    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if(getUser(name, room)) return callback({ error: 'Username is taken.' });

    addUser({ id: socket.id, name, room });
    socket.join(room);

    socket.emit('message', { user: 'admin', text: `${name}, welcome to room ${room}.`});
    socket.broadcast.to(room).emit('message', { user: 'admin', text: `${name} has joined!` });

    io.to(room).emit('roomData', { room: room, users: getUsersInRoom(room) });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUserById(socket.id);
    io.to(user.room).emit('message', { user: user.name, text: message });
    callback();
  });

  socket.on('typing', (data) => {
    socket.broadcast.to(data.room).emit('typing', data);
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if(user) {
			const { name, room } = user;
			socket.leave(room);
      io.to(room).emit('message', { user: 'Admin', text: `${name} has left.` });
			io.to(room).emit('roomData', { room: room, users: getUsersInRoom(room) });
			io.to(room).emit('typing', { name: name, room: room, value: '' });
    }
  });
});
