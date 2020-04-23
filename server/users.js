const users = []

exports.addUser = user => users.push(user)

exports.getUser = (name, room) => users.find(user => user.name === name && user.room === room)

exports.getUsersInRoom = room => users.filter(user => user.room === room)

exports.removeUser = id => {
  const index = users.findIndex(user => user.id === id)
  if(index !== -1) return users.splice(index, 1)[0]
}
