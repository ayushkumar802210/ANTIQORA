import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Restore SPA route if redirected from GitHub Pages 404 handler
const redirectPath = sessionStorage.getItem('antiqora_redirect_path');
if (redirectPath) {
  sessionStorage.removeItem('antiqora_redirect_path');
  window.history.replaceState(null, '', redirectPath);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((err) => {
      console.warn('Service Worker registration skipped/failed:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
