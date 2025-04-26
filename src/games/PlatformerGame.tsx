import React, { useEffect, useRef, useState } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const PLAYER_SIZE = 30;

type Platform = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type GameObject = {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
};

const PlatformerGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState<GameObject>({
    x: 50,
    y: CANVAS_HEIGHT - PLAYER_SIZE - 10,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    velocityY: 0
  });
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('platformerHighScore');
    return saved ? parseInt(saved) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    // Initialize platforms
    const initialPlatforms = [
      { x: 0, y: CANVAS_HEIGHT - 10, width: CANVAS_WIDTH, height: 10 }, // Ground
      { x: 200, y: 300, width: 100, height: 20 },
      { x: 400, y: 200, width: 100, height: 20 },
      { x: 600, y: 300, width: 100, height: 20 }
    ];
    setPlatforms(initialPlatforms);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isJumping) {
        setPlayer(prev => ({
          ...prev,
          velocityY: JUMP_FORCE
        }));
        setIsJumping(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isJumping]);

  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      setPlayer(prev => {
        const newPlayer = {
          ...prev,
          y: prev.y + prev.velocityY,
          velocityY: prev.velocityY + GRAVITY
        };

        // Check platform collisions
        let onPlatform = false;
        platforms.forEach(platform => {
          if (
            newPlayer.x < platform.x + platform.width &&
            newPlayer.x + newPlayer.width > platform.x &&
            newPlayer.y + newPlayer.height > platform.y &&
            newPlayer.y < platform.y + platform.height
          ) {
            if (prev.y + prev.height <= platform.y) {
              newPlayer.y = platform.y - newPlayer.height;
              newPlayer.velocityY = 0;
              onPlatform = true;
            }
          }
        });

        if (onPlatform) {
          setIsJumping(false);
        }

        // Check if player fell off
        if (newPlayer.y > CANVAS_HEIGHT) {
          setGameOver(true);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('platformerHighScore', score.toString());
          }
        }

        return newPlayer;
      });

      // Move platforms and generate new ones
      setPlatforms(prev => {
        const newPlatforms = prev
          .map(platform => ({
            ...platform,
            x: platform.x - 2
          }))
          .filter(platform => platform.x + platform.width > 0);

        if (newPlatforms.length < 5) {
          newPlatforms.push({
            x: CANVAS_WIDTH,
            y: Math.random() * (CANVAS_HEIGHT - 100) + 100,
            width: 100,
            height: 20
          });
        }

        return newPlatforms;
      });

      setScore(prev => prev + 1);
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameOver, score, highScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw platforms
    ctx.fillStyle = '#4ade80';
    platforms.forEach(platform => {
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw player
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(player.x, player.y, player.width, player.height);

  }, [player, platforms]);

  const resetGame = () => {
    setPlayer({
      x: 50,
      y: CANVAS_HEIGHT - PLAYER_SIZE - 10,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      velocityY: 0
    });
    setPlatforms([
      { x: 0, y: CANVAS_HEIGHT - 10, width: CANVAS_WIDTH, height: 10 },
      { x: 200, y: 300, width: 100, height: 20 },
      { x: 400, y: 200, width: 100, height: 20 },
      { x: 600, y: 300, width: 100, height: 20 }
    ]);
    setScore(0);
    setGameOver(false);
    setIsJumping(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-900 to-blue-700 p-4">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold mb-2 text-white">Platformer</h2>
        <div className="flex justify-center gap-8">
          <p className="text-gray-300">Score: <span className="text-blue-300">{score}</span></p>
          <p className="text-gray-300">High Score: <span className="text-blue-300">{highScore}</span></p>
        </div>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-blue-500 rounded-lg shadow-lg"
        />
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
            <div className="text-center p-6 bg-blue-900 rounded-lg shadow-xl">
              <h3 className="text-2xl font-bold mb-4 text-white">Game Over!</h3>
              <p className="mb-2 text-gray-300">Final Score: <span className="text-blue-300">{score}</span></p>
              <p className="mb-4 text-gray-300">High Score: <span className="text-blue-300">{highScore}</span></p>
              <button
                onClick={resetGame}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-full transition-all duration-200"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 text-gray-300 text-center">
        <p className="mb-2">Press SPACE to jump</p>
        <p>Avoid falling and survive as long as possible!</p>
      </div>
    </div>
  );
};

export default PlatformerGame;