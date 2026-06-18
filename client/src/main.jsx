import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import SettingsButton from './components/SettingsButton.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <SettingsButton />
  </React.StrictMode>
);
