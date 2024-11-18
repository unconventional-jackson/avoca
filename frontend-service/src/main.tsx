import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import Modal from 'react-modal';

const rootElement = document.getElementById('root');
if (rootElement) {
  Modal.setAppElement(rootElement);
} else {
  console.error('Failed to find the root element');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
