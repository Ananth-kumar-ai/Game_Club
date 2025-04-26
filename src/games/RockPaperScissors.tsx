import React, { useState, useEffect } from 'react';
import { Scissors, Hand, Circle } from 'lucide-react';

type Choice = 'rock' | 'paper' | 'scissors' | null;
type GameResult = 'win' | 'lose' | 'draw' | null;

const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState<Choice>(null);
  const [computerChoice, setComputerChoice] = useState<Choice>(null);
  const [result, setResult] = useState<GameResult>(null);
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('rpsScores');
    return saved ? JSON.parse(saved) : { wins: 0, losses: 0, draws: 0 };
  });
  const [isAnimating, setIsAnimating] = useState(false);

  const choices: Choice[] = ['rock', 'paper', 'scissors'];

  const getIcon = (choice: Choice, size = 24) => {
    switch (choice) {
      case 'rock':
        return <Circle size={size} />;
      case 'paper':
        return <Hand size={size} />;
      case 'scissors':
        return <Scissors size={size} />;
      default:
        return null;
    }
  };

  const determineWinner = (player: Choice, computer: Choice): GameResult => {
    if (player === computer) return 'draw';
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'win';
    }
    return 'lose';
  };

  const playGame = (choice: Choice) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setPlayerChoice(choice);
    setComputerChoice(null);
    setResult(null);

    // Animate computer choice
    let count = 0;
    const interval = setInterval(() => {
      setComputerChoice(choices[count % 3]);
      count++;
      if (count > 10) {
        clearInterval(interval);
        const computerFinalChoice = choices[Math.floor(Math.random() * 3)];
        setComputerChoice(computerFinalChoice);
        const gameResult = determineWinner(choice, computerFinalChoice);
        setResult(gameResult);
        setScores(prev => {
          const newScores = {
            ...prev,
            [gameResult === 'win' ? 'wins' : gameResult === 'lose' ? 'losses' : 'draws']: 
              prev[gameResult === 'win' ? 'wins' : gameResult === 'lose' ? 'losses' : 'draws'] + 1
          };
          localStorage.setItem('rpsScores', JSON.stringify(newScores));
          return newScores;
        });
        setIsAnimating(false);
      }
    }, 100);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-red-900 to-red-700 p-4">
      <div className="max-w-xl w-full bg-gray-800 p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Rock Paper Scissors</h2>
        
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <p className="text-gray-400">Wins</p>
            <p className="text-2xl font-bold text-green-500">{scores.wins}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">Draws</p>
            <p className="text-2xl font-bold text-yellow-500">{scores.draws}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">Losses</p>
            <p className="text-2xl font-bold text-red-500">{scores.losses}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="text-center">
            <p className="text-gray-400 mb-2">You</p>
            <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center">
              {playerChoice && getIcon(playerChoice, 48)}
            </div>
          </div>
          
          <div className="text-4xl font-bold text-gray-400">VS</div>
          
          <div className="text-center">
            <p className="text-gray-400 mb-2">Computer</p>
            <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center">
              {computerChoice && getIcon(computerChoice, 48)}
            </div>
          </div>
        </div>

        {result && (
          <div className={`text-center mb-8 text-2xl font-bold ${
            result === 'win' ? 'text-green-500' :
            result === 'lose' ? 'text-red-500' :
            'text-yellow-500'
          }`}>
            {result === 'win' ? 'You Win!' :
             result === 'lose' ? 'You Lose!' :
             'Draw!'}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {choices.map((choice) => (
            <button
              key={choice}
              onClick={() => playGame(choice)}
              disabled={isAnimating}
              className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                isAnimating ? 'bg-gray-700 cursor-not-allowed' :
                'bg-red-600 hover:bg-red-700'
              }`}
            >
              {getIcon(choice)}
              <span className="capitalize">{choice}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RockPaperScissors;