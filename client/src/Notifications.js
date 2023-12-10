import React from 'react';
import './Notifications.css';

function Notifications({ notifications }) {
  return (
    <div className="notifications">
      <h2>Notifications</h2>
      <ul className="notification-list">
        {notifications.map((notification, index) => (
          <li key={index}>{notification}</li>
        ))}
      </ul>
    </div>
  );
}

export default Notifications;
