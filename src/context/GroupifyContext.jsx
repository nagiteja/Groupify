import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  sessions: {},
  currentSession: null,
  participants: [],
  groups: {}
};

// Action types
const ActionTypes = {
  CREATE_SESSION: 'CREATE_SESSION',
  SET_CURRENT_SESSION: 'SET_CURRENT_SESSION',
  ADD_PARTICIPANT: 'ADD_PARTICIPANT',
  ASSIGN_GROUPS: 'ASSIGN_GROUPS',
  RESET_GROUPS: 'RESET_GROUPS',
  CLEAR_SESSION: 'CLEAR_SESSION'
};

// Reducer
const groupifyReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.CREATE_SESSION:
      const newSession = {
        id: action.payload.id,
        name: action.payload.name,
        groupCount: action.payload.groupCount,
        status: 'open',
        createdAt: new Date()
      };
      const newState = {
        ...state,
        sessions: {
          ...state.sessions,
          [action.payload.id]: newSession
        },
        currentSession: action.payload.id,
        participants: [],
        groups: {}
      };
      // Save to localStorage for real-time updates
      localStorage.setItem(`groupify_session_${action.payload.id}`, JSON.stringify(newState.sessions[action.payload.id]));
      return newState;

    case ActionTypes.SET_CURRENT_SESSION:
      // Try to load from localStorage first, then fallback to state
      const sessionData = localStorage.getItem(`groupify_session_${action.payload}`);
      let session = state.sessions[action.payload];
      
      if (sessionData) {
        try {
          session = JSON.parse(sessionData);
        } catch (e) {
          console.error('Error parsing session data:', e);
        }
      }
      
      return {
        ...state,
        currentSession: action.payload,
        participants: session ? session.participants || [] : [],
        groups: session ? session.groups || {} : {}
      };

    case ActionTypes.ADD_PARTICIPANT:
      // Check if participant already exists to prevent duplicates
      const existingParticipant = state.participants.find(p => p.name === action.payload);
      if (existingParticipant) {
        return state; // Don't add duplicate
      }

      const newParticipant = {
        id: Date.now().toString(),
        name: action.payload,
        joinedAt: new Date(),
        group: null
      };
      const updatedParticipants = [...state.participants, newParticipant];
      const updatedSession = {
        ...state.sessions[state.currentSession],
        participants: updatedParticipants
      };
      
      // Save to localStorage for real-time updates
      const sessionWithTimestamp = {
        ...updatedSession,
        lastUpdate: new Date().toISOString()
      };
      localStorage.setItem(`groupify_session_${state.currentSession}`, JSON.stringify(sessionWithTimestamp));
      
      return {
        ...state,
        participants: updatedParticipants,
        sessions: {
          ...state.sessions,
          [state.currentSession]: updatedSession
        }
      };

    case ActionTypes.ASSIGN_GROUPS:
      const shuffled = [...state.participants].sort(() => Math.random() - 0.5);
      const groupSize = Math.ceil(shuffled.length / state.sessions[state.currentSession].groupCount);
      const assignedParticipants = shuffled.map((participant, index) => ({
        ...participant,
        group: Math.floor(index / groupSize) + 1
      }));

      const grouped = {};
      assignedParticipants.forEach(participant => {
        if (!grouped[participant.group]) {
          grouped[participant.group] = [];
        }
        grouped[participant.group].push(participant);
      });

      const assignedSession = {
        ...state.sessions[state.currentSession],
        participants: assignedParticipants,
        groups: grouped,
        status: 'assigned'
      };
      
      // Save to localStorage for real-time updates
      const assignedSessionWithTimestamp = {
        ...assignedSession,
        lastUpdate: new Date().toISOString()
      };
      localStorage.setItem(`groupify_session_${state.currentSession}`, JSON.stringify(assignedSessionWithTimestamp));
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('groupify-assign', { 
        detail: { sessionId: state.currentSession, groups: grouped } 
      }));

      return {
        ...state,
        participants: assignedParticipants,
        groups: grouped,
        sessions: {
          ...state.sessions,
          [state.currentSession]: assignedSession
        }
      };

    case ActionTypes.RESET_GROUPS:
      const resetParticipants = state.participants.map(p => ({ ...p, group: null }));
      return {
        ...state,
        participants: resetParticipants,
        groups: {},
        sessions: {
          ...state.sessions,
          [state.currentSession]: {
            ...state.sessions[state.currentSession],
            participants: resetParticipants,
            groups: {},
            status: 'open'
          }
        }
      };

    case ActionTypes.CLEAR_SESSION:
      return {
        ...state,
        currentSession: null,
        participants: [],
        groups: {}
      };

    default:
      return state;
  }
};

// Context
const GroupifyContext = createContext();

// Provider component
export const GroupifyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(groupifyReducer, initialState);

  const createSession = (name, groupCount) => {
    const sessionId = Date.now().toString();
    dispatch({
      type: ActionTypes.CREATE_SESSION,
      payload: { id: sessionId, name, groupCount }
    });
    return sessionId;
  };

  const setCurrentSession = (sessionId) => {
    dispatch({
      type: ActionTypes.SET_CURRENT_SESSION,
      payload: sessionId
    });
  };

  const addParticipant = (name) => {
    dispatch({
      type: ActionTypes.ADD_PARTICIPANT,
      payload: name
    });
  };

  const assignGroups = () => {
    dispatch({
      type: ActionTypes.ASSIGN_GROUPS
    });
  };

  const resetGroups = () => {
    dispatch({
      type: ActionTypes.RESET_GROUPS
    });
  };

  const clearSession = () => {
    dispatch({
      type: ActionTypes.CLEAR_SESSION
    });
  };

  const getSession = (sessionId) => {
    return state.sessions[sessionId] || null;
  };

  const getJoinUrl = (sessionId) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/join?sessionId=${sessionId}`;
    }
    return '';
  };

  const value = {
    ...state,
    createSession,
    setCurrentSession,
    addParticipant,
    assignGroups,
    resetGroups,
    clearSession,
    getSession,
    getJoinUrl
  };

  return (
    <GroupifyContext.Provider value={value}>
      {children}
    </GroupifyContext.Provider>
  );
};

// Hook to use context
export const useGroupify = () => {
  const context = useContext(GroupifyContext);
  if (!context) {
    throw new Error('useGroupify must be used within a GroupifyProvider');
  }
  return context;
};
