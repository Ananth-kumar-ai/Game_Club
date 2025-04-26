import React, { useState, useEffect, useRef } from 'react';

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump!",
  "The five boxing wizards jump quickly.",
  "Sphinx of black quartz, judge my vow."
];

const TypingTest = () => {
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('typingHighScore');
    return saved ? parseInt(saved) : 0;
  });
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startNewTest();
  }, []);

  const startNewTest = () => {
    const randomText = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
    setText(randomText);
    setUserInput('');
    setStartTime(null);
    setEndTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!startTime) {
      setStartTime(Date.now());
    }

    setUserInput(value);

    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === text[i]) {
        correctChars++;
      }
    }
    const newAccuracy = Math.round((correctChars / value.length) * 100) || 100;
    setAccuracy(newAccuracy);

    // Check if test is complete
    if (value === text) {
      const endTime = Date.now();
      setEndTime(endTime);
      const timeInMinutes = (endTime - startTime!) / 60000;
      const wordsTyped = text.split(' ').length;
      const newWpm = Math.round(wordsTyped / timeInMinutes);
      setWpm(newWpm);
      setIsFinished(true);

      // Update high score
      if (newWpm > highScore) {
        setHighScore(newWpm);
        localStorage.setItem('typingHighScore', newWpm.toString());
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-900 to-blue-700 p-4">
      <div className="max-w-2xl w-full bg-gray-800 p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Typing Speed Test</h2>
        
        <div className="mb-8 flex justify-center gap-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">WPM</p>
            <p className="text-2xl font-bold text-blue-400">{wpm || '-'}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Accuracy</p>
            <p className="text-2xl font-bold text-blue-400">{accuracy}%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">High Score</p>
            <p className="text-2xl font-bold text-blue-400">{highScore}</p>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg mb-6">
          <p className="text-lg text-gray-300 font-mono">
            {text.split('').map((char, index) => {
              let color = 'text-gray-300';
              if (index < userInput.length) {
                color = userInput[index] === char ? 'text-green-400' : 'text-red-400';
              }
              return (
                <span key={index} className={color}>
                  {char}
                </span>
              );
            })}
          </p>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          disabled={isFinished}
          className="w-full bg-gray-600 text-white p-3 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Start typing..."
        />

        {isFinished && (
          <div className="text-center">
            <p className="text-xl text-green-400 mb-4">
              Test Complete! {wpm} WPM with {accuracy}% accuracy
            </p>
            <button
              onClick={startNewTest}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingTest;