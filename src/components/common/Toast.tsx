// Common Toast component
import React from 'react';

type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
};

const Toast: React.FC<ToastProps> = ({ message, type = 'info' }) => (
  <div className={`toast toast-${type}`}>{message}</div>
);

export default Toast;
