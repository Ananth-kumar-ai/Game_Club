import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <Gamepad2 className="h-8 w-8 text-purple-500" />
            <span className="text-xl font-bold text-white">Gaming Club</span>
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link to="/snake" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">Snake</Link>
            <Link to="/pacman" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">Pacman</Link>
            <Link to="/memory" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">Memory</Link>
            <Link to="/tictactoe" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">TicTacToe</Link>
            <Link to="/2048" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">2048</Link>
            <Link to="/quiz" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">Quiz</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;