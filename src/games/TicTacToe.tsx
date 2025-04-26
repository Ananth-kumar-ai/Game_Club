import React, { useState } from 'react';

function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || calculateWinner(board)) return;
    
    const newBoard = board.slice();
    newBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const winner = calculateWinner(board);
  const status = winner 
    ? `Winner: ${winner}`
    : board.every(square => square) 
    ? "Game is a draw!" 
    : `Next player: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">Tic Tac Toe</h1>
      <div className="mb-4 text-xl">{status}</div>
      <div className="grid grid-cols-3 gap-2 bg-gray-700 p-4 rounded-lg">
        {board.map((square, index) => (
          <button
            key={index}
            className="w-20 h-20 bg-gray-600 hover:bg-gray-500 text-3xl font-bold rounded flex items-center justify-center transition-colors"
            onClick={() => handleClick(index)}
          >
            {square}
          </button>
        ))}
      </div>
      <button
        className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        onClick={() => setBoard(Array(9).fill(null))}
      >
        Reset Game
      </button>
    </div>
  );
}

export default TicTacToe;