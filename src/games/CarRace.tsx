import React, { useEffect, useRef, useState } from 'react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const CAR_WIDTH = 40;
const CAR_HEIGHT = 60;
const OBSTACLE_WIDTH = 60;
const OBSTACLE_HEIGHT = 60;
const ROAD_SPEED = 5;

type Obstacle = {
  x: number;
  y: number;
  lane: number;
  color: string;
};

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];

const CarRace = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [carPosition, setCarPosition] = useState(CANVAS_WIDTH / 2 - CAR_WIDTH / 2);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('carRaceHighScore');
    return saved ? parseInt(saved) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [roadOffset, setRoadOffset] = useState(0);
  const carRef = useRef<HTMLImageElement>();
  const requestRef = useRef<number>();

  // Load car image
  useEffect(() => {
    const carImage = new Image();
    carImage.src = 'https://raw.githubusercontent.com/sourabhv/FlapPyBird/master/assets/sprites/car.png';
    carRef.current = carImage;
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const addObstacle = () => {
      const lane = Math.floor(Math.random() * 3);
      const x = (CANVAS_WIDTH / 3) * lane + (CANVAS_WIDTH / 6) - OBSTACLE_WIDTH / 2;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      setObstacles(prev => [...prev, { x, y: -OBSTACLE_HEIGHT, lane, color }]);
    };

    const obstacleInterval = setInterval(addObstacle, 1500);
    return () => clearInterval(obstacleInterval);
  }, [gameStarted, gameOver]);

  const animate = (time: number) => {
    if (!gameStarted || gameOver) return;

    // Update road offset
    setRoadOffset(prev => (prev + ROAD_SPEED) % 40);

    // Update obstacles
    setObstacles(prevObstacles => {
      const newObstacles = prevObstacles
        .map(obstacle => ({ ...obstacle, y: obstacle.y + ROAD_SPEED }))
        .filter(obstacle => obstacle.y < CANVAS_HEIGHT);

      // Check collisions
      newObstacles.forEach(obstacle => {
        if (
          carPosition < obstacle.x + OBSTACLE_WIDTH &&
          carPosition + CAR_WIDTH > obstacle.x &&
          CANVAS_HEIGHT - CAR_HEIGHT - 20 < obstacle.y + OBSTACLE_HEIGHT &&
          CANVAS_HEIGHT - 20 > obstacle.y
        ) {
          setGameOver(true);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('carRaceHighScore', score.toString());
          }
        }
      });

      return newObstacles;
    });

    setScore(s => s + 1);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (gameStarted && !gameOver) {
      requestRef.current = requestAnimationFrame(animate);
      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Draw road background
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw road lines
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([20, 20]);
    ctx.lineWidth = 2;

    // Draw moving road lines
    for (let i = -40 + roadOffset; i < CANVAS_HEIGHT; i += 40) {
      // Left lane
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 3, i);
      ctx.lineTo(CANVAS_WIDTH / 3, i + 20);
      ctx.stroke();

      // Right lane
      ctx.beginPath();
      ctx.moveTo((CANVAS_WIDTH / 3) * 2, i);
      ctx.lineTo((CANVAS_WIDTH / 3) * 2, i + 20);
      ctx.stroke();
    }

    // Draw car
    ctx.fillStyle = '#ff0000';
    if (carRef.current) {
      ctx.drawImage(
        carRef.current,
        carPosition,
        CANVAS_HEIGHT - CAR_HEIGHT - 20,
        CAR_WIDTH,
        CAR_HEIGHT
      );
    } else {
      // Fallback car drawing
      ctx.fillRect(carPosition, CANVAS_HEIGHT - CAR_HEIGHT - 20, CAR_WIDTH, CAR_HEIGHT);
    }

    // Draw obstacles
    obstacles.forEach(obstacle => {
      ctx.fillStyle = obstacle.color;
      ctx.fillRect(obstacle.x, obstacle.y, OBSTACLE_WIDTH, OBSTACLE_HEIGHT);
      
      // Add some details to obstacles
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(obstacle.x + 10, obstacle.y + 10, OBSTACLE_WIDTH - 20, 5);
      ctx.fillRect(obstacle.x + 10, obstacle.y + OBSTACLE_HEIGHT - 15, OBSTACLE_WIDTH - 20, 5);
    });

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High Score: ${highScore}`, 10, 60);
  }, [carPosition, obstacles, score, highScore, roadOffset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          setCarPosition(pos => Math.max(0, pos - 20));
          break;
        case 'ArrowRight':
          setCarPosition(pos => Math.min(CANVAS_WIDTH - CAR_WIDTH, pos + 20));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);

  const resetGame = () => {
    setCarPosition(CANVAS_WIDTH / 2 - CAR_WIDTH / 2);
    setObstacles([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setRoadOffset(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold mb-2 text-red-500">Car Race</h2>
        <div className="flex justify-center gap-8">
          <p className="text-gray-300">Score: <span className="text-red-500 font-bold">{score}</span></p>
          <p className="text-gray-300">High Score: <span className="text-red-500 font-bold">{highScore}</span></p>
        </div>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-lg shadow-2xl border-4 border-red-500"
        />
        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
            <div className="text-center p-6 bg-gray-800 rounded-xl border-2 border-red-500">
              <h3 className="text-2xl font-bold mb-4 text-red-500">Ready to Race?</h3>
              <button
                onClick={() => setGameStarted(true)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-full transition-all duration-200 transform hover:scale-105"
              >
                Start Race
              </button>
            </div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
            <div className="text-center p-6 bg-gray-800 rounded-xl border-2 border-red-500">
              <h3 className="text-2xl font-bold mb-2 text-red-500">Game Over!</h3>
              <p className="mb-2 text-gray-300">Final Score: <span className="text-red-500 font-bold">{score}</span></p>
              <p className="mb-4 text-gray-300">High Score: <span className="text-red-500 font-bold">{highScore}</span></p>
              <button
                onClick={resetGame}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-full transition-all duration-200 transform hover:scale-105"
              >
                Race Again
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 text-gray-300 text-center">
        <p className="text-lg mb-2">Use left and right arrow keys to control the car</p>
        <p>Dodge the obstacles and set a new high score!</p>
      </div>
    </div>
  );
};

export default CarRace;