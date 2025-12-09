/**
 * @file useToast.js
 * @description Custom hook for managing toast notifications
 * @pattern Custom Hook Pattern
 */

import { useState } from 'react';

/**
 * Toast notification manager hook
 * @returns {Object} Toast state and control methods
 * @returns {Array} toasts - Array of active toast notifications
 * @returns {Function} addToast - Add a new toast notification
 * @returns {Function} removeToast - Remove a toast by ID
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  /**
   * Add a new toast notification
   * @param {string} message - Toast message content
   * @param {string} type - Toast type: 'success' | 'error' | 'warning' | 'info'
   * @returns {number} Toast ID
   */
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    return id;
  };

  /**
   * Remove a toast notification by ID
   * @param {number} id - Toast ID to remove
   */
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
};
