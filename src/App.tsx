import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CoordinatorDashboard from './components/CoordinatorDashboard';
import PlayerInterface from './components/PlayerInterface';
import GameInterface from './components/GameInterface';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/coordinator" element={<CoordinatorDashboard />} />
          <Route path="/player" element={<PlayerInterface />} />
          <Route path="/game/:quizId" element={<GameInterface />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;