import React, { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;

type Position = {
  x: number;
  y: number;
};

type Ghost = {
  position: Position;
  color: string;
  direction: Position;
};

const PacmanGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pacman, setPacman] = useState<Position>({ x: 1, y: 1 });
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [dots, setDots] = useState<Position[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('pacmanHighScore');
    return saved ? parseInt(saved) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [ghosts, setGhosts] = useState<Ghost[]>([
    { position: { x: 18, y: 1 }, color: '#FF0000', direction: { x: -1, y: 0 } }, // Red ghost
    { position: { x: 18, y: 18 }, color: '#FFB8FF', direction: { x: 0, y: -1 } }, // Pink ghost
    { position: { x: 1, y: 18 }, color: '#00FFFF', direction: { x: 1, y: 0 } }, // Cyan ghost
    { position: { x: 9, y: 9 }, color: '#FFB852', direction: { x: 0, y: 1 } }, // Orange ghost
  ]);

  // Initialize dots
  useEffect(() => {
    const initialDots: Position[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (x !== 1 || y !== 1) {
          initialDots.push({ x, y });
        }
      }
    }
    setDots(initialDots);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const moveInterval = setInterval(() => {
      // Move Pacman
      const newPosition = {
        x: (pacman.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (pacman.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };
      setPacman(newPosition);

      // Move Ghosts
      setGhosts(prevGhosts => 
        prevGhosts.map(ghost => {
          let newX = ghost.position.x + ghost.direction.x;
          let newY = ghost.position.y + ghost.direction.y;

          // Change direction if hitting walls
          if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
            const possibleDirections = [
              { x: 1, y: 0 },
              { x: -1, y: 0 },
              { x: 0, y: 1 },
              { x: 0, y: -1 }
            ];
            const newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
            return {
              ...ghost,
              direction: newDirection,
              position: ghost.position // Stay in place this turn
            };
          }

          return {
            ...ghost,
            position: { x: newX, y: newY }
          };
        })
      );

      // Check for ghost collisions
      ghosts.forEach(ghost => {
        if (ghost.position.x === newPosition.x && ghost.position.y === newPosition.y) {
          setGameOver(true);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('pacmanHighScore', score.toString());
          }
        }
      });

      // Check for dot collection
      const remainingDots = dots.filter(dot => 
        dot.x !== newPosition.x || dot.y !== newPosition.y
      );

      if (remainingDots.length < dots.length) {
        const newScore = score + 10;
        setScore(newScore);
        setDots(remainingDots);

        if (remainingDots.length === 0) {
          setGameOver(true);
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('pacmanHighScore', newScore.toString());
          }
        }
      }
    }, 200);

    return () => clearInterval(moveInterval);
  }, [pacman, direction, dots, score, gameOver, ghosts, highScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw maze walls
    ctx.strokeStyle = '#0000FF';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw dots
    ctx.fillStyle = '#ffffff';
    dots.forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(
        x * CELL_SIZE + CELL_SIZE / 2,
        y * CELL_SIZE + CELL_SIZE / 2,
        2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Draw ghosts
    ghosts.forEach(ghost => {
      ctx.fillStyle = ghost.color;
      const x = ghost.position.x * CELL_SIZE;
      const y = ghost.position.y * CELL_SIZE;
      
      // Ghost body
      ctx.beginPath();
      ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 2, Math.PI, 0, false);
      ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
      ctx.lineTo(x, y + CELL_SIZE);
      ctx.closePath();
      ctx.fill();
      
      // Ghost eyes
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x + CELL_SIZE / 3, y + CELL_SIZE / 2, 3, 0, Math.PI * 2);
      ctx.arc(x + (CELL_SIZE * 2) / 3, y + CELL_SIZE / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Pacman
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    const centerX = pacman.x * CELL_SIZE + CELL_SIZE / 2;
    const centerY = pacman.y * CELL_SIZE + CELL_SIZE / 2;
    const mouthAngle = 0.2 * Math.PI;
    const startAngle = direction.x === -1 ? Math.PI + mouthAngle : 
                      direction.x === 1 ? 0 + mouthAngle :
                      direction.y === -1 ? 1.5 * Math.PI + mouthAngle :
                      0.5 * Math.PI + mouthAngle;
    const endAngle = startAngle + (2 * Math.PI - 2 * mouthAngle);
    ctx.arc(centerX, centerY, CELL_SIZE / 2, startAngle, endAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fill();
  }, [pacman, dots, direction, ghosts]);

  const resetGame = () => {
    setPacman({ x: 1, y: 1 });
    setDirection({ x: 1, y: 0 });
    const initialDots: Position[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (x !== 1 || y !== 1) {
          initialDots.push({ x, y });
        }
      }
    }
    setDots(initialDots);
    setScore(0);
    setGhosts([
      { position: { x: 18, y: 1 }, color: '#FF0000', direction: { x: -1, y: 0 } },
      { position: { x: 18, y: 18 }, color: '#FFB8FF', direction: { x: 0, y: -1 } },
      { position: { x: 1, y: 18 }, color: '#00FFFF', direction: { x: 1, y: 0 } },
      { position: { x: 9, y: 9 }, color: '#FFB852', direction: { x: 0, y: 1 } },
    ]);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-900 to-blue-900">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold mb-2 text-yellow-400">Pacman</h2>
        <div className="flex justify-center gap-8">
          <p className="text-gray-300">Score: <span className="text-yellow-400">{score}</span></p>
          <p className="text-gray-300">High Score: <span className="text-yellow-400">{highScore}</span></p>
        </div>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border-4 border-blue-500 rounded-lg shadow-lg shadow-blue-500/50"
        />
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
            <div className="text-center p-6 bg-gray-800 rounded-lg shadow-xl border-2 border-yellow-400">
              <h3 className="text-2xl font-bold mb-4 text-yellow-400">Game Over!</h3>
              <p className="mb-2 text-gray-300">Final Score: <span className="text-yellow-400">{score}</span></p>
              <p className="mb-4 text-gray-300">High Score: <span className="text-yellow-400">{highScore}</span></p>
              <button
                onClick={resetGame}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-full transition-all duration-200 transform hover:scale-105"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 text-gray-300 text-center">
        <p className="mb-2">Use arrow keys to control Pacman</p>
        <p>Avoid the ghosts and collect all dots!</p>
      </div>
    </div>
  );
};

export default PacmanGame;