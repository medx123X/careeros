import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from '../hooks/useAuth';
import { ToastProvider } from '../hooks/useToast';
import { Toasts } from '../components/Toast';
import App from './App';
import '../styles/main.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
        <Toasts />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);
