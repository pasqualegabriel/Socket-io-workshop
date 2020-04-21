import React, { useState, useEffect } from "react"
import queryString from 'query-string'
import io from "socket.io-client"

import TextContainer from '../TextContainer/TextContainer'
import Messages from '../Messages/Messages'
import InfoBar from '../InfoBar/InfoBar'
import Input from '../Input/Input'
import Typing from '../Typing/Typing'

import './Chat.css'

const ENDPOINT = 'http://localhost:8001'
const socket = io(ENDPOINT)

const Chat = ({ location }) => {
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [users, setUsers] = useState([])
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState([])

  useEffect(() => {
    const { name, room } = queryString.parse(location.search)

    setRoom(room)
    setName(name)

    socket.emit('join', { name, room }, (data) => {
      if(data) {
        alert(data.error)
        window.location.pathname = '/'
      }
    })
  }, [location.search])
  
  useEffect(() => {
    socket.on('message', message => {
      setMessages(messages => [ ...messages, message ])
    })
    
    socket.on("roomData", ({ users }) => {
      setUsers(users)
    })

    socket.on("typing", ({ name, value }) => {
      name = name.toLowerCase()
      setTyping(typing => 
        value
          ? typing.includes(name) ? typing : [...typing, name]
          : typing.filter(userName => userName !== name) 
      )
    })
  }, [])

  const sendMessage = (event) => {
    event.preventDefault()

    if(message) {
      socket.emit('sendMessage', message, () => setMessage(''))
    }
    socket.emit('typing', { name, room, value: '' })
  }

  const writing = (value) => {
    setMessage(value)
    socket.emit('typing', { name, room, value })
  }

  return (
    <div className="outerContainer">
      <div className="container">
          <InfoBar room={room} />
          <Messages messages={messages} name={name} />
          <Typing typing={typing} />
          <Input message={message} typing={writing} sendMessage={sendMessage} />
      </div>
      <TextContainer users={users} name={name}/>
    </div>
  )
}

export default Chat
