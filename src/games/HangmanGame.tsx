import React, { useState, useEffect } from 'react';

const WORDS = {
  animals: ['ELEPHANT', 'GIRAFFE', 'PENGUIN', 'KANGAROO', 'DOLPHIN'],
  countries: ['FRANCE', 'JAPAN', 'BRAZIL', 'CANADA', 'EGYPT'],
  fruits: ['APPLE', 'BANANA', 'ORANGE', 'MANGO', 'GRAPE']
};

type Category = keyof typeof WORDS;

const HangmanGame = () => {
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [remainingGuesses, setRemainingGuesses] = useState(6);
  const [category, setCategory] = useState<Category | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('hangmanHighScore');
    return saved ? parseInt(saved) : 0;
  });

  const startGame = (selectedCategory: Category) => {
    const words = WORDS[selectedCategory];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setWord(randomWord);
    setGuessedLetters([]);
    setRemainingGuesses(6);
    setCategory(selectedCategory);
    setGameStatus('playing');
  };

  const guessLetter = (letter: string) => {
    if (gameStatus !== 'playing') return;

    if (!guessedLetters.includes(letter)) {
      const newGuessedLetters = [...guessedLetters, letter];
      setGuessedLetters(newGuessedLetters);

      if (!word.includes(letter)) {
        const newRemainingGuesses = remainingGuesses - 1;
        setRemainingGuesses(newRemainingGuesses);

        if (newRemainingGuesses === 0) {
          setGameStatus('lost');
        }
      } else {
        // Check if word is complete
        const isComplete = word
          .split('')
          .every(char => newGuessedLetters.includes(char));
        
        if (isComplete) {
          const newScore = score + 1;
          setScore(newScore);
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('hangmanHighScore', newScore.toString());
          }
          setGameStatus('won');
        }
      }
    }
  };

  const renderWord = () => {
    return word.split('').map((letter, index) => (
      <span
        key={index}
        className="mx-1 text-3xl font-bold inline-block w-8 text-center border-b-2 border-white"
      >
        {guessedLetters.includes(letter) ? letter : '_'}
      </span>
    ));
  };

  const renderHangman = () => {
    const parts = [
      // Base
      <line key="base" x1="20" y1="140" x2="100" y2="140" stroke="white" strokeWidth="4"/>,
      // Vertical pole
      <line key="pole" x1="60" y1="20" x2="60" y2="140" stroke="white" strokeWidth="4"/>,
      // Top
      <line key="top" x1="60" y1="20" x2="120" y2="20" stroke="white" strokeWidth="4"/>,
      // Rope
      <line key="rope" x1="120" y1="20" x2="120" y2="40" stroke="white" strokeWidth="4"/>,
      // Head
      <circle key="head" cx="120" cy="50" r="10" stroke="white" strokeWidth="4" fill="none"/>,
      // Body
      <line key="body" x1="120" y1="60" x2="120" y2="90" stroke="white" strokeWidth="4"/>,
      // Left arm
      <line key="leftArm" x1="120" y1="70" x2="100" y2="80" stroke="white" strokeWidth="4"/>,
      // Right arm
      <line key="rightArm" x1="120" y1="70" x2="140" y2="80" stroke="white" strokeWidth="4"/>,
      // Left leg
      <line key="leftLeg" x1="120" y1="90" x2="100" y2="110" stroke="white" strokeWidth="4"/>,
      // Right leg
      <line key="rightLeg" x1="120" y1="90" x2="140" y2="110" stroke="white" strokeWidth="4"/>
    ];

    const partsToShow = 10 - remainingGuesses;

    return (
      <svg width="160" height="160" className="mb-8">
        {parts.slice(0, partsToShow)}
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-indigo-900 to-indigo-700 p-4">
      <div className="max-w-2xl w-full bg-gray-800 p-8 rounded-lg shadow-xl text-center">
        <h2 className="text-3xl font-bold mb-6 text-white">Hangman</h2>
        
        <div className="flex justify-center gap-4 mb-6">
          <div className="text-center">
            <p className="text-gray-400">Score</p>
            <p className="text-2xl font-bold text-indigo-400">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">High Score</p>
            <p className="text-2xl font-bold text-indigo-400">{highScore}</p>
          </div>
        </div>

        {!category ? (
          <div className="space-y-4">
            <h3 className="text-xl text-white mb-4">Choose a Category</h3>
            {Object.keys(WORDS).map((cat) => (
              <button
                key={cat}
                onClick={() => startGame(cat as Category)}
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-gray-400 mb-2">Category: {category}</p>
              <p className="text-gray-400 mb-4">Remaining Guesses: {remainingGuesses}</p>
              {renderHangman()}
              <div className="mb-8">{renderWord()}</div>
            </div>

            {gameStatus === 'playing' ? (
              <div className="grid grid-cols-7 gap-2">
                {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                  <button
                    key={letter}
                    onClick={() => guessLetter(letter)}
                    disabled={guessedLetters.includes(letter)}
                    className={`p-2 rounded font-bold transition-colors ${
                      guessedLetters.includes(letter)
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p className={`text-2xl font-bold mb-4 ${
                  gameStatus === 'won' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {gameStatus === 'won' ? 'You Won!' : 'Game Over!'}
                </p>
                <p className="text-gray-400 mb-4">
                  The word was: <span className="text-white font-bold">{word}</span>
                </p>
                <button
                  onClick={() => setCategory(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Play Again
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HangmanGame;