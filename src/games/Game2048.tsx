import React, { useState, useEffect } from 'react';

const Game2048 = () => {
  const [grid, setGrid] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('2048HighScore');
    return saved ? parseInt(saved) : 0;
  });
  const [gameOver, setGameOver] = useState(false);

  const initializeGrid = () => {
    const newGrid = Array(4).fill(null).map(() => Array(4).fill(0));
    addNewTile(addNewTile(newGrid));
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    initializeGrid();
  }, []);

  const addNewTile = (currentGrid: number[][]) => {
    const availableCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentGrid[i][j] === 0) {
          availableCells.push({ x: i, y: j });
        }
      }
    }
    
    if (availableCells.length > 0) {
      const { x, y } = availableCells[Math.floor(Math.random() * availableCells.length)];
      currentGrid[x][y] = Math.random() < 0.9 ? 2 : 4;
    }
    
    return currentGrid;
  };

  const moveGrid = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    let moved = false;
    const newGrid = grid.map(row => [...row]);
    let newScore = score;

    const rotate = (grid: number[][]) => {
      const N = grid.length;
      const rotated = Array(N).fill(null).map(() => Array(N).fill(0));
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          rotated[j][N - 1 - i] = grid[i][j];
        }
      }
      return rotated;
    };

    const moveLeft = (grid: number[][]) => {
      const N = grid.length;
      for (let i = 0; i < N; i++) {
        let col = 0;
        for (let j = 1; j < N; j++) {
          if (grid[i][j] !== 0) {
            if (grid[i][col] === 0) {
              grid[i][col] = grid[i][j];
              grid[i][j] = 0;
              moved = true;
            } else if (grid[i][col] === grid[i][j]) {
              grid[i][col] *= 2;
              newScore += grid[i][col];
              grid[i][j] = 0;
              col++;
              moved = true;
            } else {
              col++;
              if (col !== j) {
                grid[i][col] = grid[i][j];
                grid[i][j] = 0;
                moved = true;
              }
            }
          }
        }
      }
      return grid;
    };

    let tempGrid = [...newGrid];
    
    switch (direction) {
      case 'left':
        tempGrid = moveLeft(tempGrid);
        break;
      case 'right':
        tempGrid = rotate(rotate(moveLeft(rotate(rotate(tempGrid)))));
        break;
      case 'up':
        tempGrid = rotate(rotate(rotate(moveLeft(rotate(tempGrid)))));
        break;
      case 'down':
        tempGrid = rotate(moveLeft(rotate(rotate(rotate(tempGrid)))));
        break;
    }

    if (moved) {
      addNewTile(tempGrid);
      setGrid(tempGrid);
      setScore(newScore);
      
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('2048HighScore', newScore.toString());
      }

      // Check for game over
      let hasMove = false;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (tempGrid[i][j] === 0) {
            hasMove = true;
            break;
          }
          if (i < 3 && tempGrid[i][j] === tempGrid[i + 1][j]) hasMove = true;
          if (j < 3 && tempGrid[i][j] === tempGrid[i][j + 1]) hasMove = true;
        }
      }
      if (!hasMove) setGameOver(true);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          moveGrid('up');
          break;
        case 'ArrowDown':
          moveGrid('down');
          break;
        case 'ArrowLeft':
          moveGrid('left');
          break;
        case 'ArrowRight':
          moveGrid('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [grid, gameOver]);

  const getTileColor = (value: number) => {
    const colors: Record<number, string> = {
      2: 'bg-gray-200 text-gray-800',
      4: 'bg-gray-300 text-gray-800',
      8: 'bg-orange-300 text-white',
      16: 'bg-orange-400 text-white',
      32: 'bg-orange-500 text-white',
      64: 'bg-orange-600 text-white',
      128: 'bg-yellow-300 text-white',
      256: 'bg-yellow-400 text-white',
      512: 'bg-yellow-500 text-white',
      1024: 'bg-yellow-600 text-white',
      2048: 'bg-yellow-700 text-white'
    };
    return colors[value] || 'bg-yellow-800 text-white';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-yellow-900 to-yellow-700 p-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">2048</h2>
          <div>
            <p className="text-gray-400">Score: <span className="text-yellow-400 font-bold">{score}</span></p>
            <p className="text-gray-400">Best: <span className="text-yellow-400 font-bold">{highScore}</span></p>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-4 gap-2">
            {grid.map((row, i) => 
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-xl transition-all ${
                    cell === 0 ? 'bg-gray-600' : getTileColor(cell)
                  }`}
                >
                  {cell !== 0 && cell}
                </div>
              ))
            )}
          </div>
        </div>

        {gameOver && (
          <div className="text-center mb-6">
            <p className="text-xl font-bold text-red-500 mb-4">Game Over!</p>
            <button
              onClick={initializeGrid}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="text-center text-gray-400">
          <p>Use arrow keys to move tiles</p>
          <p>Combine matching numbers to reach 2048!</p>
        </div>
      </div>
    </div>
  );
};

export default Game2048;