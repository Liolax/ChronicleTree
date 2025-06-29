// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { TreeStateProvider } from './context/TreeStateContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TreeStateProvider>
      <App />
    </TreeStateProvider>
  </React.StrictMode>
);
