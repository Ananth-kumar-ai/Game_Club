import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Card = {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const DIFFICULTY_LEVELS = {
  easy: 6,
  medium: 8,
  hard: 12
};

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'];

const MemoryGame = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [difficulty, setDifficulty] = useState<keyof typeof DIFFICULTY_LEVELS>('easy');
  const [bestScores, setBestScores] = useState(() => {
    const saved = localStorage.getItem('memoryGameBestScores');
    return saved ? JSON.parse(saved) : { easy: Infinity, medium: Infinity, hard: Infinity };
  });

  const initializeGame = () => {
    const numPairs = DIFFICULTY_LEVELS[difficulty];
    const selectedEmojis = EMOJIS.slice(0, numPairs);
    const cardValues = [...selectedEmojis, ...selectedEmojis];
    const shuffledCards = cardValues
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setStartTime(null);
    setEndTime(null);
  };

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  const handleCardClick = (id: number) => {
    if (!startTime) {
      setStartTime(new Date());
    }

    if (
      flippedCards.length === 2 || // Don't allow more than 2 cards flipped
      cards[id].isFlipped || // Don't allow flipping already flipped card
      cards[id].isMatched // Don't allow flipping matched cards
    ) {
      return;
    }

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(m => m + 1);
      
      const [firstId, secondId] = newFlippedCards;
      if (cards[firstId].value === cards[secondId].value) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstId].isMatched = true;
          matchedCards[secondId].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);

          // Check if game is complete
          if (matchedCards.every(card => card.isMatched)) {
            const endTime = new Date();
            setEndTime(endTime);
            if (startTime) {
              const timeInSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
              if (timeInSeconds < bestScores[difficulty]) {
                const newBestScores = { ...bestScores, [difficulty]: timeInSeconds };
                setBestScores(newBestScores);
                localStorage.setItem('memoryGameBestScores', JSON.stringify(newBestScores));
              }
            }
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const unflippedCards = [...cards];
          unflippedCards[firstId].isFlipped = false;
          unflippedCards[secondId].isFlipped = false;
          setCards(unflippedCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-purple-900 to-purple-700 p-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 text-white">Memory Game</h2>
        <div className="flex gap-4 mb-4">
          {Object.keys(DIFFICULTY_LEVELS).map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level as keyof typeof DIFFICULTY_LEVELS)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                difficulty === level
                  ? 'bg-purple-500 text-white'
                  : 'bg-purple-200 text-purple-800 hover:bg-purple-300'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-8 text-white">
          <p>Moves: {moves}</p>
          <p>Time: {startTime && !endTime ? 
            formatTime((new Date().getTime() - startTime.getTime()) / 1000) :
            endTime && startTime ?
            formatTime((endTime.getTime() - startTime.getTime()) / 1000) :
            '0:00'
          }</p>
          <p>Best: {bestScores[difficulty] === Infinity ? '-' : formatTime(bestScores[difficulty])}</p>
        </div>
      </div>

      <div className={`grid gap-4 ${
        difficulty === 'easy' ? 'grid-cols-3' :
        difficulty === 'medium' ? 'grid-cols-4' :
        'grid-cols-6'
      }`}>
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className={`w-20 h-20 cursor-pointer perspective-1000`}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleCardClick(card.id)}
          >
            <motion.div
              className="relative w-full h-full transition-transform duration-500 transform-style-3d"
              animate={{ rotateY: card.isFlipped ? 180 : 0 }}
            >
              <div className="absolute w-full h-full bg-purple-600 rounded-lg flex items-center justify-center text-white border-2 border-purple-300 backface-hidden">
                ?
              </div>
              <div className="absolute w-full h-full bg-white rounded-lg flex items-center justify-center text-4xl transform rotate-y-180 backface-hidden">
                {card.value}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {endTime && (
        <div className="mt-8">
          <button
            onClick={initializeGame}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;