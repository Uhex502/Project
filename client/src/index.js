import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Importing global CSS styles
import App from './App';
//import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter for routing

// <BrowserRouter>    </BrowserRouter>
ReactDOM.render(
  <React.StrictMode>  
      <App />
  </React.StrictMode>,
  document.getElementById('root')
);