import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from '../hooks/useAuth';
import { ToastProvider } from '../hooks/useToast';
import { Toasts } from '../components/Toast';
import SidebarApp from './SidebarApp';
import '../styles/main.css';

ReactDOM.createRoot(document.getElementById('sidebar-root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <SidebarApp />
        <Toasts />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);
