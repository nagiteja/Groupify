import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGroupify } from '../context/GroupifyContext';

const JoinView = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [participantName, setParticipantName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [participant, setParticipant] = useState(null);

  const {
    participants,
    groups,
    addParticipant,
    setCurrentSession,
    getSession
  } = useGroupify();

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      return;
    }

    // Set the current session to load its data
    setCurrentSession(sessionId);
  }, [sessionId, setCurrentSession]);

  // Poll for group assignments every 3 seconds
  useEffect(() => {
    if (!sessionId) return;

    const pollForAssignments = () => {
      const sessionData = localStorage.getItem(`groupify_session_${sessionId}`);
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          const sessionHasGroups = session.groups && Object.keys(session.groups).length > 0;
          
          // Only update if groups are assigned
          if (sessionHasGroups) {
            setCurrentSession(sessionId);
          }
        } catch (e) {
          console.error('Error parsing session data:', e);
        }
      }
    };

    const interval = setInterval(pollForAssignments, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, [sessionId, setCurrentSession]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!participantName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      addParticipant(participantName.trim());
      setParticipant({ id: Date.now().toString(), name: participantName.trim() });
      setSuccess('Successfully joined the session!');
      setParticipantName('');
    } catch (err) {
      setError('Failed to join session. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getParticipantGroup = () => {
    if (!participant) return null;
    const foundParticipant = participants.find(p => p.id === participant.id);
    return foundParticipant?.group || null;
  };


  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Session</h1>
          <p className="text-gray-600">No session ID provided</p>
        </div>
      </div>
    );
  }

  const participantGroup = getParticipantGroup();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Join Session</h1>
          <p className="mt-2 text-gray-600">Enter your name to join and be assigned to a group</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {!participant ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Join Session</h2>
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label htmlFor="participantName" className="block text-sm font-medium text-gray-700">
                    Your Name
                  </label>
                  <input
                    id="participantName"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your name"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}

                {success && (
                  <div className="text-green-600 text-sm">{success}</div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Joining...' : 'Join Session'}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">Welcome, {participant.name}!</h2>
              
              {participantGroup ? (
                <div className="text-center">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-8 mb-6 shadow-lg">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-4xl font-bold mb-4">
                      YOU'RE IN GROUP {participantGroup}!
                    </h3>
                    <p className="text-xl text-indigo-100">
                      Find your group members below
                    </p>
                  </div>
                  
                  {groups[participantGroup] && (
                    <div className="bg-white border-2 border-indigo-200 rounded-xl p-6 shadow-lg">
                      <h4 className="text-xl font-bold text-center mb-4 text-gray-800">👥 Your Group Members:</h4>
                      <ul className="space-y-3">
                        {groups[participantGroup].map((member) => (
                          <li key={member.id} className="flex items-center justify-center">
                            <span className={`inline-block w-4 h-4 rounded-full mr-3 ${
                              member.id === participant.id ? 'bg-indigo-500' : 'bg-gray-400'
                            }`}></span>
                            <span className={`text-lg ${member.id === participant.id ? 'font-bold text-indigo-600' : 'text-gray-700'}`}>
                              {member.name}
                            </span>
                            {member.id === participant.id && (
                              <span className="ml-3 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">YOU</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                      Waiting for Group Assignment
                    </h3>
                    <p className="text-yellow-700">
                      The admin will assign groups soon. Please wait...
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <p className="text-sm text-gray-600">
                      Total participants: {participants.length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Show all groups if assigned */}
        {Object.keys(groups).length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">🏆 All Groups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(groups).map(([groupNumber, groupMembers]) => {
                const colors = [
                  'bg-red-100 border-red-300 text-red-800',
                  'bg-blue-100 border-blue-300 text-blue-800', 
                  'bg-green-100 border-green-300 text-green-800',
                  'bg-yellow-100 border-yellow-300 text-yellow-800',
                  'bg-purple-100 border-purple-300 text-purple-800',
                  'bg-pink-100 border-pink-300 text-pink-800'
                ];
                const colorClass = colors[(parseInt(groupNumber) - 1) % colors.length];
                
                return (
                  <div key={groupNumber} className={`border-2 rounded-lg p-4 ${colorClass}`}>
                    <h3 className="font-bold text-lg mb-3 text-center">Group {groupNumber}</h3>
                    <ul className="space-y-2">
                      {groupMembers.map((member) => (
                        <li key={member.id} className="text-center font-medium">
                          {member.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinView;
