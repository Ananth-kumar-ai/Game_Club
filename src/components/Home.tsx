import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Cake as Snake, 
  Ghost, 
  Bird, 
  Car,
  Brain,
  Hash,
  Keyboard,
  HelpCircle,
  Scissors,
  Grid2x2,
  Flag,
  AlignJustify,
  Grid,
  Timer
} from 'lucide-react';

const GameCard = ({ title, icon: Icon, path, description }: { title: string; icon: any; path: string; description: string }) => (
  <Link to={path} className="bg-gray-800 p-6 rounded-lg shadow-xl hover:transform hover:scale-105 transition-transform duration-300">
    <div className="flex flex-col items-center text-center">
      <Icon className="w-12 h-12 mb-4 text-purple-500" />
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  </Link>
);

const Home = () => {
  const games = [
    {
      title: "Snake Game",
      icon: Snake,
      path: "/snake",
      description: "Classic snake game - eat food, grow longer, don't hit the walls!"
    },
    {
      title: "Pacman",
      icon: Ghost,
      path: "/pacman",
      description: "Navigate through the maze, eat dots, avoid ghosts!"
    },
    {
      title: "Flappy Bird",
      icon: Bird,
      path: "/flappy-bird",
      description: "Guide your bird through pipes - simple but challenging!"
    },
    {
      title: "Car Race",
      icon: Car,
      path: "/car-race",
      description: "Race through traffic, dodge obstacles, set high scores!"
    },
    {
      title: "Memory Game",
      icon: Brain,
      path: "/memory",
      description: "Test your memory by matching pairs of cards!"
    },
    {
      title: "Tic Tac Toe",
      icon: Hash,
      path: "/tictactoe",
      description: "Classic game with a modern twist and power-ups!"
    },
    {
      title: "Typing Test",
      icon: Keyboard,
      path: "/typing",
      description: "Test your typing speed and accuracy!"
    },
    {
      title: "Quiz Game",
      icon: HelpCircle,
      path: "/quiz",
      description: "Test your knowledge across various categories!"
    },
    {
      title: "Rock Paper Scissors",
      icon: Scissors,
      path: "/rps",
      description: "Play the classic game against the computer!"
    },
    {
      title: "2048",
      icon: Grid2x2,
      path: "/2048",
      description: "Merge tiles to reach 2048 in this addictive puzzle!"
    },
    {
      title: "Platformer",
      icon: Flag,
      path: "/platformer",
      description: "Jump and dodge in this side-scrolling adventure!"
    },
    {
      title: "Hangman",
      icon: AlignJustify,
      path: "/hangman",
      description: "Guess the word before the hangman is complete!"
    },
    {
      title: "Sudoku",
      icon: Grid,
      path: "/sudoku",
      description: "Fill the grid following Sudoku rules!"
    },
    {
      title: "Idle Clicker",
      icon: Timer,
      path: "/idle",
      description: "Click to earn points and unlock upgrades!"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">Welcome to Gaming Club</h1>
      <p className="text-gray-400 text-center mb-12">Choose your favorite game and start playing!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {games.map((game, index) => (
          <GameCard 
            key={index}
            title={game.title}
            icon={game.icon}
            path={game.path}
            description={game.description}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;