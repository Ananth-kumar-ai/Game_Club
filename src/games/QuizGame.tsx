import React, { useState, useEffect } from 'react';

type Question = {
  category: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

const CATEGORIES = ['General', 'Science', 'Movies', 'Sports'];

const QUESTIONS: Record<string, Question[]> = {
  General: [
    {
      category: 'General',
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 'Paris'
    },
    {
      category: 'General',
      question: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 'Mars'
    }
  ],
  Science: [
    {
      category: 'Science',
      question: 'What is the chemical symbol for gold?',
      options: ['Ag', 'Au', 'Fe', 'Cu'],
      correctAnswer: 'Au'
    },
    {
      category: 'Science',
      question: 'What is the hardest natural substance on Earth?',
      options: ['Gold', 'Iron', 'Diamond', 'Platinum'],
      correctAnswer: 'Diamond'
    }
  ],
  Movies: [
    {
      category: 'Movies',
      question: 'Who directed Jurassic Park?',
      options: ['James Cameron', 'Steven Spielberg', 'George Lucas', 'Peter Jackson'],
      correctAnswer: 'Steven Spielberg'
    },
    {
      category: 'Movies',
      question: 'What year was the first Star Wars movie released?',
      options: ['1975', '1977', '1980', '1983'],
      correctAnswer: '1977'
    }
  ],
  Sports: [
    {
      category: 'Sports',
      question: 'In which sport would you perform a slam dunk?',
      options: ['Football', 'Basketball', 'Tennis', 'Golf'],
      correctAnswer: 'Basketball'
    },
    {
      category: 'Sports',
      question: 'How many players are there in a soccer team?',
      options: ['9', '10', '11', '12'],
      correctAnswer: '11'
    }
  ]
};

const QuizGame = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [highScores, setHighScores] = useState(() => {
    const saved = localStorage.getItem('quizHighScores');
    return saved ? JSON.parse(saved) : {};
  });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  const currentQuestion = selectedCategory ? QUESTIONS[selectedCategory][currentQuestionIndex] : null;

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!isAnswerChecked) {
      setIsAnswerChecked(true);
      if (selectedAnswer === currentQuestion?.correctAnswer) {
        setScore(score + 1);
      }
      return;
    }

    setSelectedAnswer(null);
    setIsAnswerChecked(false);

    if (currentQuestionIndex < QUESTIONS[selectedCategory].length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const finalScore = score + (selectedAnswer === currentQuestion?.correctAnswer ? 1 : 0);
      if (!highScores[selectedCategory] || finalScore > highScores[selectedCategory]) {
        const newHighScores = { ...highScores, [selectedCategory]: finalScore };
        setHighScores(newHighScores);
        localStorage.setItem('quizHighScores', JSON.stringify(newHighScores));
      }
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
  };

  if (!selectedCategory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-indigo-900 to-indigo-700 p-4">
        <div className="max-w-2xl w-full bg-gray-800 p-8 rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">Quiz Game</h2>
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
              >
                {category}
                {highScores[category] && (
                  <div className="text-sm mt-2">
                    High Score: {highScores[category]}/{QUESTIONS[category].length}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-indigo-900 to-indigo-700 p-4">
        <div className="max-w-2xl w-full bg-gray-800 p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Quiz Complete!</h2>
          <p className="text-2xl mb-4 text-indigo-400">
            Your Score: {score}/{QUESTIONS[selectedCategory].length}
          </p>
          <p className="text-xl mb-6 text-gray-300">
            High Score: {highScores[selectedCategory] || 0}/{QUESTIONS[selectedCategory].length}
          </p>
          <div className="space-x-4">
            <button
              onClick={restartQuiz}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => setSelectedCategory('')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
            >
              Choose Another Category
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-indigo-900 to-indigo-700 p-4">
      <div className="max-w-2xl w-full bg-gray-800 p-8 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-indigo-400">{selectedCategory}</h3>
          <p className="text-gray-300">
            Question {currentQuestionIndex + 1}/{QUESTIONS[selectedCategory].length}
          </p>
        </div>

        <div className="mb-8">
          <p className="text-xl text-white mb-6">{currentQuestion?.question}</p>
          <div className="grid grid-cols-1 gap-4">
            {currentQuestion?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`p-4 rounded-lg text-left transition-colors ${
                  selectedAnswer === option
                    ? isAnswerChecked
                      ? option === currentQuestion.correctAnswer
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                      : 'bg-indigo-600 text-white'
                    : isAnswerChecked && option === currentQuestion.correctAnswer
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
                disabled={isAnswerChecked}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleNextQuestion}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {isAnswerChecked
            ? currentQuestionIndex === QUESTIONS[selectedCategory].length - 1
              ? 'Finish Quiz'
              : 'Next Question'
            : 'Check Answer'}
        </button>
      </div>
    </div>
  );
};

export default QuizGame;