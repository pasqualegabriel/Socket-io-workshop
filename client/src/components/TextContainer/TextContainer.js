import React from 'react';

import onlineIcon from '../../icons/onlineIcon.png';

import './TextContainer.css';

const TextContainer = ({ users, name: activeUsername }) => (
  <div className="textContainer">
    {
      users
        ? (
          <div>
            <h1>People currently chatting:</h1>
            <div className="activeContainer">
              <h2>
                {<div key={activeUsername.toLowerCase()} className="activeItem">
                    {activeUsername.toLowerCase()} (me)
                    <img alt="Online Icon" src={onlineIcon}/>
                  </div>}
                {users.filter(({name}) => name !== activeUsername.toLowerCase()).map(({name}) => (
                  <div key={name} className="activeItem">
                    {name}
                    <img alt="Online Icon" src={onlineIcon}/>
                  </div>
                ))}
              </h2>
            </div>
          </div>
        )
        : null
    }
  </div>
);

export default TextContainer;