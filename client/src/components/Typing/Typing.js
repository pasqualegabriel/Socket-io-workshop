import React from 'react';

import './Typing.css';

const Typing = ({ typing }) => (
  <div id='typing'>{typing.length ? typing.length === 1 ? `${typing[0]} is typing` : `${typing.join(', ')} are typing` : ''}</div>
);

export default Typing;