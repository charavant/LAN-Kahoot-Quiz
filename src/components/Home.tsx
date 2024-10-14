import React from 'react';
import { Link } from 'react-router-dom';
import { Users, User } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <h1 className="text-4xl font-bold mb-8">Welcome to LAN Quiz Game</h1>
      <div className="flex space-x-4">
        <Link
          to="/coordinator"
          className="flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg shadow-md hover:bg-blue-100 transition duration-300"
        >
          <Users className="mr-2" />
          Coordinator
        </Link>
        <Link
          to="/player"
          className="flex items-center bg-white text-purple-600 px-6 py-3 rounded-lg shadow-md hover:bg-purple-100 transition duration-300"
        >
          <User className="mr-2" />
          Player
        </Link>
      </div>
    </div>
  );
};

export default Home;