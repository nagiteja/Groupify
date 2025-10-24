import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GroupifyProvider } from './context/GroupifyContext';
import AdminView from './components/AdminView';
import JoinView from './components/JoinView';

function App() {
  return (
    <GroupifyProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminView />} />
            <Route path="/join" element={<JoinView />} />
          </Routes>
        </div>
      </Router>
    </GroupifyProvider>
  );
}

export default App;
