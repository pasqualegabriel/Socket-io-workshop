const express = require('express')
const socketio = require('socket.io')
const router = require('./router')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./users')

const app = express()

app.set('port', process.env.PORT || 8000)
app.use(router)

const server = app.listen(app.get('port'), () => console.log('Server is running on port', app.get('port')))

const io = socketio(server)

io.on('connection', socket => {
  socket.on('join', ({ name, room }, callback) => {
    if(!name || !room) return callback({ error: 'Username and room are required.' })

    name = name.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(getUser(name, room)) return callback({ error: 'Username is taken.' })

    socket.join(room)
    addUser({ id: socket.id, name, room })

    socket.emit('message', { user: 'admin', text: `${name}, welcome to room ${room}` })
    socket.broadcast.to(room).emit('message', { user: 'admin', text: `${name} has joined!` })
    io.to(room).emit('roomData', { users: getUsersInRoom(room) })
    callback()
  })

  socket.on('sendMessage', ({ name, room, message }, callback) => {
    io.to(room).emit('message', { user: name, text: message })
    callback()
  })

  socket.on('typing', data => socket.broadcast.to(data.room).emit('typing', data))

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    if(user) {
      const { name, room } = user
      socket.leave(room)
      io.to(room).emit('message', { user: 'admin', text: `${name} has left!` })
      io.to(room).emit('roomData', { users: getUsersInRoom(room) })
      io.to(room).emit('typing', { name, room })
    }
  })
})
