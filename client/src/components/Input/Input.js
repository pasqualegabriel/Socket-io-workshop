import React from 'react';

import './Input.css';

const Input = ({ typing, sendMessage, message }) => (
  <form className="form">
    <input
      className="input"
      type="text"
      placeholder="Type a message..."
      value={message}
      onChange={({ target: { value } }) => typing(value)}
      onKeyPress={event => event.key === 'Enter' ? sendMessage(event) : null}
    />
    <button className="sendButton" onClick={e => sendMessage(e)} onKeyPress={e => e.keyCode === 13 ? sendMessage(e) : null}>Send</button>
  </form>
)

export default Input;