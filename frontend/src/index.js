import React from 'react';
import ReactDOM from 'react-dom/client'; // Importing ReactDOM from the client package
import './index.css';
import App from './App';

// Creating a root React element using ReactDOM.createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rendering the App component inside the root element
root.render(
  <App />
);

// Function for measuring performance in your app
