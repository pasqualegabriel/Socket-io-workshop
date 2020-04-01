import React, { useState, useEffect } from "react";
import queryString from 'query-string';
import io from "socket.io-client";

import TextContainer from '../TextContainer/TextContainer';
import Messages from '../Messages/Messages';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';

import './Chat.css';

const ENDPOINT = 'http://localhost:8001';
const socket = io(ENDPOINT);

const Chat = ({ location }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [users, setUsers] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState([]);

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    setRoom(room);
    setName(name)

    socket.emit('join', { name, room }, (error) => {
      if(error) {
        alert(error);
        window.location.pathname = '/'
      }
    });
  }, [location.search]);
  
  useEffect(() => {
    socket.on('message', message => {
      setMessages(messages => [ ...messages, message ]);
    });
    
    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });

    socket.on("typing", ({ name, value }) => {    
      setTyping(typing => {
        name = name.toLowerCase()
        if(!value.length) {
          return typing.filter(w => w.toLowerCase() !== name)
        }
        const user = typing.find(w => w.toLowerCase() === name)
        if(!user) return [...typing, name]
        return typing
      })
    });
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();

    if(message) {
      socket.emit('sendMessage', message, () => setMessage(''));
    }
    socket.emit('typing', { name, room, value: '' })
  }

  const onTyping = (value) => {
    setMessage(value);
    socket.emit('typing', { name, room, value })
  }

  const whoIsTyping = () => {
    const typingWithoutMe = typing.filter(user => user.toLowerCase() !== name.toLowerCase())
    return typingWithoutMe.length ? typingWithoutMe.length === 1 ? `${typingWithoutMe[0]} is typing` : `${typingWithoutMe.join(', ')} are typing` : ''
  }

  return (
    <div className="outerContainer">
      <div className="container">
          <InfoBar room={room} />
          <Messages messages={messages} name={name} />
          <div id='typing'>{whoIsTyping()}</div>
          <Input message={message} typing={onTyping} sendMessage={sendMessage} />
      </div>
      <TextContainer users={users} name={name}/>
    </div>
  );
}

export default Chat;
