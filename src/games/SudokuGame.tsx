import React, { useState, useEffect } from 'react';

const GRID_SIZE = 9;
const BOX_SIZE = 3;

type Cell = {
  value: number;
  isFixed: boolean;
  isValid: boolean;
};

const SudokuGame = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const generateSudoku = (difficulty: 'easy' | 'medium' | 'hard') => {
    // Create a solved Sudoku grid
    const solvedGrid: number[][] = Array(GRID_SIZE).fill(null)
      .map(() => Array(GRID_SIZE).fill(0));

    const fillGrid = (grid: number[][]): boolean => {
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (grid[row][col] === 0) {
            for (let num = 1; num <= 9; num++) {
              if (isValidPlacement(grid, row, col, num)) {
                grid[row][col] = num;
                if (fillGrid(grid)) {
                  return true;
                }
                grid[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    fillGrid(solvedGrid);

    // Create puzzle by removing numbers
    const cellsToRemove = {
      easy: 30,
      medium: 40,
      hard: 50
    }[difficulty];

    const puzzle: Cell[][] = solvedGrid.map(row =>
      row.map(value => ({ value, isFixed: true, isValid: true }))
    );

    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      if (puzzle[row][col].value !== 0) {
        puzzle[row][col] = { value: 0, isFixed: false, isValid: true };
        removed++;
      }
    }

    return puzzle;
  };

  const isValidPlacement = (grid: number[][], row: number, col: number, num: number): boolean => {
    // Check row
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[x][col] === num) return false;
    }

    // Check box
    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
    for (let i = 0; i < BOX_SIZE; i++) {
      for (let j = 0; j < BOX_SIZE; j++) {
        if (grid[boxRow + i][boxCol + j] === num) return false;
      }
    }

    return true;
  };

  const validateGrid = () => {
    const newGrid = [...grid];
    let isValid = true;

    // Check each cell
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (newGrid[row][col].value === 0) {
          isValid = false;
          continue;
        }

        const currentValue = newGrid[row][col].value;
        newGrid[row][col].value = 0;
        const validPlacement = isValidPlacement(
          newGrid.map(row => row.map(cell => cell.value)),
          row,
          col,
          currentValue
        );
        newGrid[row][col].value = currentValue;
        newGrid[row][col].isValid = validPlacement;
        if (!validPlacement) isValid = false;
      }
    }

    setGrid(newGrid);
    setIsComplete(isValid);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!grid[row][col].isFixed) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberInput = (number: number) => {
    if (selectedCell && !grid[selectedCell.row][selectedCell.col].isFixed) {
      const newGrid = [...grid];
      newGrid[selectedCell.row][selectedCell.col].value = number;
      setGrid(newGrid);
      validateGrid();
    }
  };

  const startGame = (difficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(difficulty);
    setGrid(generateSudoku(difficulty));
    setGameStarted(true);
    setIsComplete(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-purple-900 to-purple-700 p-4">
      {!gameStarted ? (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">Sudoku</h2>
          <div className="space-y-4">
            <button
              onClick={() => startGame('easy')}
              className="w-48 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Easy
            </button>
            <button
              onClick={() => startGame('medium')}
              className="w-48 block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Medium
            </button>
            <button
              onClick={() => startGame('hard')}
              className="w-48 block bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Hard
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl w-full bg-gray-800 p-8 rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Sudoku - {difficulty}</h2>
            <button
              onClick={() => setGameStarted(false)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors"
            >
              New Game
            </button>
          </div>

          <div className="grid grid-cols-9 gap-1 mb-6">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={`
                    w-10 h-10 flex items-center justify-center text-lg font-bold rounded
                    ${cell.isFixed ? 'bg-gray-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}
                    ${!cell.isValid ? 'text-red-500' : 'text-white'}
                    ${selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? 'ring-2 ring-purple-500' : ''}
                    ${rowIndex % 3 === 0 && rowIndex !== 0 ? 'border-t-2 border-gray-500' : ''}
                    ${colIndex % 3 === 0 && colIndex !== 0 ? 'border-l-2 border-gray-500' : ''}
                  `}
                >
                  {cell.value !== 0 ? cell.value : ''}
                </button>
              ))
            )}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
              <button
                key={number}
                onClick={() => handleNumberInput(number)}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded transition-colors"
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => selectedCell && handleNumberInput(0)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded transition-colors"
            >
              Clear
            </button>
          </div>

          {isComplete && (
            <div className="mt-6 text-center">
              <p className="text-2xl font-bold text-green-500">Congratulations! Puzzle Complete!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SudokuGame;