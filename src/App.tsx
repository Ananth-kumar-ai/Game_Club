import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import SnakeGame from './games/SnakeGame';
import PacmanGame from './games/PacmanGame';
import FlappyBird from './games/FlappyBird';
import CarRace from './games/CarRace';
import MemoryGame from './games/MemoryGame';
import TicTacToe from './games/TicTacToe';
import TypingTest from './games/TypingTest';
import QuizGame from './games/QuizGame';
import RockPaperScissors from './games/RockPaperScissors';
import Game2048 from './games/Game2048';
import PlatformerGame from './games/PlatformerGame';
import HangmanGame from './games/HangmanGame';
import SudokuGame from './games/SudokuGame';
import IdleGame from './games/IdleGame';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/snake" element={<SnakeGame />} />
          <Route path="/pacman" element={<PacmanGame />} />
          <Route path="/flappy-bird" element={<FlappyBird />} />
          <Route path="/car-race" element={<CarRace />} />
          <Route path="/memory" element={<MemoryGame />} />
          <Route path="/tictactoe" element={<TicTacToe />} />
          <Route path="/typing" element={<TypingTest />} />
          <Route path="/quiz" element={<QuizGame />} />
          <Route path="/rps" element={<RockPaperScissors />} />
          <Route path="/2048" element={<Game2048 />} />
          <Route path="/platformer" element={<PlatformerGame />} />
          <Route path="/hangman" element={<HangmanGame />} />
          <Route path="/sudoku" element={<SudokuGame />} />
          <Route path="/idle" element={<IdleGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;