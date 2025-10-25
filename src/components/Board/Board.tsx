import React from "react";
import { GameState, GameStatus } from "@/types/game";
import Cell from "./Cell";

interface BoardProps {
  state: GameState;
  onRevealCell: (cellId: string) => void;
  onToggleFlag: (cellId: string) => void;
}

/**
 * Game board component that renders the grid of cells
 */
const Board: React.FC<BoardProps> = ({ state, onRevealCell, onToggleFlag }) => {
  const gameOver =
    state.status === GameStatus.WON || state.status === GameStatus.LOST;

  return (
    <div
      className="inline-block bg-gray-300 p-3 dark:bg-gray-700"
      style={{
        border: "3px solid",
        borderColor: "#ffffff #808080 #808080 #ffffff",
        borderRadius: "2px",
      }}
    >
      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: `repeat(${state.cols}, minmax(0, 1fr))`,
        }}
      >
        {state.board.map((cell) => (
          <Cell
            key={cell.id}
            cell={cell}
            onReveal={onRevealCell}
            onFlag={onToggleFlag}
            gameOver={gameOver}
          />
        ))}
      </div>
      {state.board.length === 0 && (
        <div className="flex h-64 w-64 items-center justify-center text-gray-600 dark:text-gray-300">
          Click to start
        </div>
      )}
    </div>
  );
};

export default Board;
