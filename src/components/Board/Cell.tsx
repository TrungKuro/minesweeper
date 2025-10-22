import React from "react";
import { Cell as CellType } from "@/types/game";
import { cn } from "@/lib/utils";

interface CellProps {
  cell: CellType;
  onReveal: (cellId: string) => void;
  onFlag: (cellId: string) => void;
  gameOver: boolean;
}

/**
 * Individual cell component for the Minesweeper board
 * Memoized to prevent unnecessary re-renders
 */
const Cell = React.memo(({ cell, onReveal, onFlag, gameOver }: CellProps) => {
  const handleClick = () => {
    if (!gameOver && !cell.isRevealed && !cell.isFlagged) {
      onReveal(cell.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!gameOver && !cell.isRevealed) {
      onFlag(cell.id);
    }
  };

  // Determine cell appearance
  const getCellContent = () => {
    if (!cell.isRevealed) {
      return cell.isFlagged ? "🚩" : "";
    }

    if (cell.isMine) {
      return "💣";
    }

    return cell.adjacentMines > 0 ? cell.adjacentMines : "";
  };

  const getCellColor = () => {
    if (!cell.isRevealed) return "";

    if (cell.isMine) return "text-red-600";

    // Color coding for numbers
    const colorMap: Record<number, string> = {
      1: "text-blue-600",
      2: "text-green-600",
      3: "text-red-600",
      4: "text-purple-600",
      5: "text-yellow-600",
      6: "text-cyan-600",
      7: "text-black",
      8: "text-gray-600",
    };

    return colorMap[cell.adjacentMines] || "";
  };

  return (
    <button
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={cn(
        "flex h-8 w-8 items-center justify-center border border-gray-400 text-sm font-bold transition-colors",
        cell.isRevealed
          ? "bg-gray-200"
          : "bg-gray-300 hover:bg-gray-400 active:bg-gray-500",
        getCellColor(),
      )}
      disabled={gameOver && !cell.isRevealed}
    >
      {getCellContent()}
    </button>
  );
});

Cell.displayName = "Cell";

export default Cell;
