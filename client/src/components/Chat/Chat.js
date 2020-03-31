import React, { useState, useEffect } from "react";
import queryString from 'query-string';
import io from "socket.io-client";

import TextContainer from '../TextContainer/TextContainer';
import Messages from '../Messages/Messages';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';

import './Chat.css';

let socket;

const Chat = ({ location }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [users, setUsers] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState([]);
  const ENDPOINT = 'http://localhost:8001';

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setRoom(room);
    setName(name)

    socket.emit('join', { name, room }, (error) => {
      if(error) {
        alert(error);
      }
    });
  }, [ENDPOINT, location.search]);
  
  useEffect(() => {
    socket.on('message', message => {
      setMessages(messages => [ ...messages, message ]);
    });
    
    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });

    socket.on("typing", (users) => {    
      setTyping(users)
    });
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();

    if(message) {
      socket.emit('sendMessage', message, () => setMessage(''));
    }
    socket.emit('stop:typing', { name, room })
  }

  const onTyping = (value) => {
    setMessage(value);
    if(value) {
      socket.emit('start:typing', { name, room })
    } else {
      socket.emit('stop:typing', { name, room })
    }
  }

  const whoIsTyping = () => {
    const typingWithoutMe = typing.filter(user => user.name.toLowerCase() !== name.toLowerCase())
    return typingWithoutMe.length ? typingWithoutMe.length === 1 ? `${typingWithoutMe[0].name} is typing` : `${typingWithoutMe.map(({name}) => name).join(', ')} are typing` : ''
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
