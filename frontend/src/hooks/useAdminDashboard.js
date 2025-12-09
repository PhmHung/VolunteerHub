/**
 * @file useAdminDashboard.js
 * @description Business logic hook for Admin Dashboard
 * @pattern Custom Hook Pattern - Separates business logic from UI
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents, approveEvent, clearEventMessages } from '../features/event/eventSlice';
import { fetchAllUsers, clearMessages } from '../features/user/userSlice';
import { clearRegistrationMessages } from '../features/registration/registrationSlice';
import { useToast } from './useToast';

/**
 * Admin Dashboard Business Logic Hook
 * Manages all state and side effects for the admin dashboard
 * 
 * @returns {Object} Dashboard state and methods
 */
export const useAdminDashboard = () => {
  const dispatch = useDispatch();
  const { toasts, addToast, removeToast } = useToast();
  
  // Redux state selectors
  const { 
    list: allEvents, 
    successMessage: eventSuccessMessage, 
    error: eventError 
  } = useSelector((state) => state.event);
  
  const { 
    users: allUsers, 
    message: userMessage, 
    error: userError 
  } = useSelector((state) => state.user);
  
  const { 
    pendingRegistrations, 
    successMessage: regSuccessMessage, 
    error: regError 
  } = useSelector((state) => state.registration);

  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingManagerRequests, setPendingManagerRequests] = useState([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Modal states
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [selectedManagerRequest, setSelectedManagerRequest] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingEventDetail, setViewingEventDetail] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: null, 
    type: 'question' 
  });
  const [promptModal, setPromptModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: null 
  });

  /**
   * Load initial data on mount
   */
  useEffect(() => {
    dispatch(fetchEvents({ status: '' })); // Get all events including pending
    dispatch(fetchAllUsers());
  }, [dispatch]);

  /**
   * Filter pending data from Redux state
   */
  useEffect(() => {
    const pending = allEvents.filter(e => e.status === 'pending');
    setPendingEvents(pending);

    const managerReqs = allUsers.filter(u => u.pendingManagerRequest === true);
    setPendingManagerRequests(managerReqs);
  }, [allEvents, allUsers]);

  /**
   * Handle success/error messages from Redux
   */
  useEffect(() => {
    if (eventSuccessMessage) {
      addToast(eventSuccessMessage, 'success');
      dispatch(clearEventMessages());
    }
    if (eventError) {
      addToast(eventError, 'error');
      dispatch(clearEventMessages());
    }
    if (userMessage) {
      addToast(userMessage, 'success');
      dispatch(clearMessages());
    }
    if (userError) {
      addToast(userError, 'error');
      dispatch(clearMessages());
    }
    if (regSuccessMessage) {
      addToast(regSuccessMessage, 'success');
      dispatch(clearRegistrationMessages());
    }
    if (regError) {
      addToast(regError, 'error');
      dispatch(clearRegistrationMessages());
    }
  }, [
    eventSuccessMessage, 
    eventError, 
    userMessage, 
    userError, 
    regSuccessMessage, 
    regError, 
    dispatch,
    addToast
  ]);

  /**
   * Navigation Handlers
   */
  const handleViewUser = (user) => {
    setViewingUser(user);
    setViewingEventDetail(null);
  };

  const handleViewEventDetail = (event) => {
    setViewingEventDetail(event);
    setViewingUser(null);
  };

  /**
   * Event approval handlers
   */
  const handleApproveEvent = async (eventId, adminNote = '') => {
    await dispatch(approveEvent({ eventId, status: 'approved', adminNote }));
    setSelectedEvent(null);
    dispatch(fetchEvents({ status: '' }));
  };

  const handleRejectEvent = async (eventId, adminNote) => {
    await dispatch(approveEvent({ eventId, status: 'rejected', adminNote }));
    setSelectedEvent(null);
    dispatch(fetchEvents({ status: '' }));
  };

  return {
    // State
    allEvents,
    allUsers,
    pendingEvents,
    pendingRegistrations,
    pendingManagerRequests,
    activeTab,
    showExportMenu,
    toasts,
    
    // Modal states
    selectedEvent,
    selectedRegistration,
    selectedManagerRequest,
    viewingUser,
    viewingEventDetail,
    confirmModal,
    promptModal,
    
    // Setters
    setActiveTab,
    setShowExportMenu,
    setSelectedEvent,
    setSelectedRegistration,
    setSelectedManagerRequest,
    setViewingUser,
    setViewingEventDetail,
    setConfirmModal,
    setPromptModal,
    
    // Methods
    addToast,
    removeToast,
    handleViewUser,
    handleViewEventDetail,
    handleApproveEvent,
    handleRejectEvent,
    
    // Redux actions
    dispatch,
  };
};
