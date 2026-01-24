import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AppProvider } from './context/AppContext'; // Import Context

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider> {/* Wrap App inside Context Provider */}
      <App />
    </AppProvider>
  </React.StrictMode>
);