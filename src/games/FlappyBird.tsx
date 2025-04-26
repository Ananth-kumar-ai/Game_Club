import React, { useEffect, useRef, useState } from 'react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const GRAVITY = 0.5;
const JUMP_FORCE = -10;

const FlappyBird = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [birdPosition, setBirdPosition] = useState(CANVAS_HEIGHT / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [birdRotation, setBirdRotation] = useState(0);
  const [pipes, setPipes] = useState<{ x: number; topHeight: number }[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('flappyHighScore');
    return saved ? parseInt(saved) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const backgroundRef = useRef<HTMLImageElement>();
  const birdRef = useRef<HTMLImageElement>();

  // Load images
  useEffect(() => {
    const bgImage = new Image();
    bgImage.src = 'https://raw.githubusercontent.com/sourabhv/FlapPyBird/master/assets/sprites/background-day.png';
    backgroundRef.current = bgImage;

    const birdImage = new Image();
    birdImage.src = 'https://raw.githubusercontent.com/sourabhv/FlapPyBird/master/assets/sprites/redbird-midflap.png';
    birdRef.current = birdImage;
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const addPipe = () => {
      const topHeight = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50;
      setPipes(prev => [...prev, { x: CANVAS_WIDTH, topHeight }]);
    };

    const pipeInterval = setInterval(addPipe, 2000);
    return () => clearInterval(pipeInterval);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      setBirdVelocity(v => v + GRAVITY);
      setBirdPosition(p => p + birdVelocity);
      setBirdRotation(birdVelocity * 2);

      // Update pipes
      setPipes(prevPipes => {
        const newPipes = prevPipes
          .map(pipe => ({ ...pipe, x: pipe.x - 2 }))
          .filter(pipe => pipe.x > -PIPE_WIDTH);

        // Check for score
        newPipes.forEach(pipe => {
          if (pipe.x === CANVAS_WIDTH / 2 - PIPE_WIDTH) {
            const newScore = score + 1;
            setScore(newScore);
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('flappyHighScore', newScore.toString());
            }
          }
        });

        return newPipes;
      });

      // Check collisions
      const bird = {
        x: CANVAS_WIDTH / 4,
        y: birdPosition,
        width: BIRD_SIZE,
        height: BIRD_SIZE
      };

      // Check wall collisions
      if (birdPosition < 0 || birdPosition > CANVAS_HEIGHT - BIRD_SIZE) {
        setGameOver(true);
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('flappyHighScore', score.toString());
        }
      }

      // Check pipe collisions
      pipes.forEach(pipe => {
        if (
          bird.x < pipe.x + PIPE_WIDTH &&
          bird.x + bird.width > pipe.x &&
          (bird.y < pipe.topHeight || bird.y + bird.height > pipe.topHeight + PIPE_GAP)
        ) {
          setGameOver(true);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('flappyHighScore', score.toString());
          }
        }
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [birdPosition, birdVelocity, pipes, gameStarted, gameOver, score, highScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Draw background
    if (backgroundRef.current) {
      ctx.drawImage(backgroundRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Draw pipes
    ctx.fillStyle = '#2E8B57';
    pipes.forEach(pipe => {
      // Top pipe
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      // Pipe cap
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(pipe.x - 3, pipe.topHeight - 20, PIPE_WIDTH + 6, 20);

      // Bottom pipe
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(
        pipe.x,
        pipe.topHeight + PIPE_GAP,
        PIPE_WIDTH,
        CANVAS_HEIGHT - (pipe.topHeight + PIPE_GAP)
      );
      // Pipe cap
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(pipe.x - 3, pipe.topHeight + PIPE_GAP, PIPE_WIDTH + 6, 20);
    });

    // Draw bird
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 4 + BIRD_SIZE / 2, birdPosition + BIRD_SIZE / 2);
    ctx.rotate(birdRotation * Math.PI / 180);
    
    if (birdRef.current) {
      ctx.drawImage(
        birdRef.current,
        -BIRD_SIZE / 2,
        -BIRD_SIZE / 2,
        BIRD_SIZE,
        BIRD_SIZE
      );
    } else {
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(-BIRD_SIZE / 2, -BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE);
    }
    ctx.restore();

    // Draw score
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText(score.toString(), CANVAS_WIDTH / 2, 60);
    ctx.fillText(score.toString(), CANVAS_WIDTH / 2, 60);
  }, [birdPosition, pipes, score, birdRotation]);

  const handleClick = () => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    if (!gameOver) {
      setBirdVelocity(JUMP_FORCE);
    }
  };

  const resetGame = () => {
    setBirdPosition(CANVAS_HEIGHT / 2);
    setBirdVelocity(0);
    setBirdRotation(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-sky-400 to-sky-600">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold mb-2 text-white">Flappy Bird</h2>
        <div className="flex justify-center gap-8">
          <p className="text-white">Score: <span className="font-bold">{score}</span></p>
          <p className="text-white">High Score: <span className="font-bold">{highScore}</span></p>
        </div>
      </div>
      <div className="relative" onClick={handleClick}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-lg shadow-2xl border-4 border-white"
        />
        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-center p-6 bg-white bg-opacity-90 rounded-xl shadow-xl">
              <h3 className="text-2xl font-bold mb-4 text-sky-600">Ready to Play?</h3>
              <p className="text-gray-600 mb-4">Click to start flapping!</p>
              <button
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-full transition-all duration-200 transform hover:scale-105"
              >
                Start Game
              </button>
            </div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-center p-6 bg-white bg-opacity-90 rounded-xl shadow-xl">
              <h3 className="text-2xl font-bold mb-2 text-sky-600">Game Over!</h3>
              <p className="mb-2 text-gray-600">Final Score: <span className="font-bold text-sky-600">{score}</span></p>
              <p className="mb-4 text-gray-600">High Score: <span className="font-bold text-sky-600">{highScore}</span></p>
              <button
                onClick={resetGame}
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-full transition-all duration-200 transform hover:scale-105"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 text-white text-center">
        <p className="text-lg">Click or tap anywhere to flap!</p>
      </div>
    </div>
  );
};

export default FlappyBird;