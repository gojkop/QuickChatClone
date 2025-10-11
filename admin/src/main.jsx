// admin/src/main.jsx - With ToastProvider
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import App from './App.jsx';
import './index.css';

const root = document.getElementById('root');

createRoot(root).render(
  <BrowserRouter>
    <ToastProvider>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
    </ToastProvider>
  </BrowserRouter>
);