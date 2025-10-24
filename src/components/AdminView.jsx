import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { useGroupify } from '../context/GroupifyContext';

const AdminView = () => {
  const [sessionName, setSessionName] = useState('');
  const [groupCount, setGroupCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    currentSession,
    participants,
    groups,
    createSession,
    assignGroups,
    resetGroups,
    getJoinUrl,
    setCurrentSession
  } = useGroupify();

  // Poll for updates every 3 seconds when there's a current session
  useEffect(() => {
    if (!currentSession) return;

    const pollForUpdates = () => {
      const sessionData = localStorage.getItem(`groupify_session_${currentSession}`);
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          const sessionParticipantCount = session.participants ? session.participants.length : 0;
          
          // Only update if participant count actually changed
          if (sessionParticipantCount !== participants.length) {
            setCurrentSession(currentSession);
          }
        } catch (e) {
          console.error('Error parsing session data:', e);
        }
      }
    };

    const interval = setInterval(pollForUpdates, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, [currentSession, participants.length, setCurrentSession]);

  const handleCreateSession = (e) => {
    e.preventDefault();
    if (!sessionName.trim()) {
      setError('Please enter a session name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      createSession(sessionName, groupCount);
      setSessionName('');
    } catch (err) {
      setError('Failed to create session. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignGroups = () => {
    if (participants.length === 0) {
      setError('No participants to assign');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      assignGroups();
    } catch (err) {
      setError('Failed to assign groups. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetGroups = () => {
    setIsLoading(true);
    setError('');

    try {
      resetGroups();
    } catch (err) {
      setError('Failed to reset groups. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create New Session
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Set up a new group assignment session
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleCreateSession}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="sessionName" className="sr-only">
                  Session Name
                </label>
                <input
                  id="sessionName"
                  name="sessionName"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Session name"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="groupCount" className="sr-only">
                  Number of Groups
                </label>
                <input
                  id="groupCount"
                  name="groupCount"
                  type="number"
                  min="2"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Number of groups"
                  value={groupCount}
                  onChange={(e) => setGroupCount(parseInt(e.target.value))}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Current Session</h1>
          <p className="mt-2 text-gray-600">Session ID: {currentSession}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Join Link</h2>
            <div className="text-center">
              <QRCode value={getJoinUrl(currentSession)} size={200} />
              <p className="mt-4 text-sm text-gray-600">
                Scan this QR code to join the session
              </p>
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs break-all">
                {getJoinUrl(currentSession)}
              </div>
            </div>
          </div>

          {/* Participants Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              Participants ({participants.length})
              <span className="ml-2 text-sm text-green-600 animate-pulse">● Live Updates</span>
            </h2>
            
            {participants.length === 0 ? (
              <p className="text-gray-500">No participants yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>{participant.name}</span>
                    {participant.group && (
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm">
                        Group {participant.group}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {participants.length > 0 && (
              <div className="mt-6 space-y-2">
                <button
                  onClick={handleAssignGroups}
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isLoading ? 'Assigning...' : 'Assign Groups'}
                </button>
                
                {Object.keys(groups).length > 0 && (
                  <button
                    onClick={handleResetGroups}
                    disabled={isLoading}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 disabled:opacity-50"
                  >
                    Reset Groups
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 text-red-600 text-sm">{error}</div>
            )}
          </div>
        </div>

        {/* Groups Display - Big Screen Friendly */}
        {Object.keys(groups).length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">🎉 GROUPS ASSIGNED! 🎉</h2>
              <p className="text-xl text-gray-600">Check your devices to see your group!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Object.entries(groups).map(([groupNumber, groupMembers]) => {
                const colors = [
                  'bg-red-100 border-red-300 text-red-800',
                  'bg-blue-100 border-blue-300 text-blue-800', 
                  'bg-green-100 border-green-300 text-green-800',
                  'bg-yellow-100 border-yellow-300 text-yellow-800',
                  'bg-purple-100 border-purple-300 text-purple-800',
                  'bg-pink-100 border-pink-300 text-pink-800',
                  'bg-indigo-100 border-indigo-300 text-indigo-800',
                  'bg-orange-100 border-orange-300 text-orange-800'
                ];
                const colorClass = colors[(parseInt(groupNumber) - 1) % colors.length];
                
                return (
                  <div key={groupNumber} className={`border-4 rounded-xl p-6 ${colorClass} shadow-lg`}>
                    <div className="text-center mb-4">
                      <h3 className="text-3xl font-bold mb-2">GROUP {groupNumber}</h3>
                      <div className="text-lg font-semibold">
                        {groupMembers.length} {groupMembers.length === 1 ? 'Member' : 'Members'}
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {groupMembers.map((member, index) => (
                        <li key={member.id} className="text-lg font-medium flex items-center">
                          <span className="inline-block w-3 h-3 rounded-full bg-current mr-3"></span>
                          {member.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 text-center">
              <button
                onClick={handleResetGroups}
                disabled={isLoading}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-lg disabled:opacity-50"
              >
                🔄 Reshuffle Groups
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;
