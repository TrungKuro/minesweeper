import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
 * Features Framer Motion animations for reveal and flag toggle
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

    if (cell.isMine) return "text-black dark:text-white";

    // Classic Minesweeper number colors (matching original Windows XP)
    const colorMap: Record<number, string> = {
      1: "text-blue-700", // Blue
      2: "text-green-700", // Green
      3: "text-red-600", // Red
      4: "text-blue-900", // Dark Blue
      5: "text-red-900", // Maroon
      6: "text-cyan-600", // Cyan
      7: "text-black dark:text-white", // Black
      8: "text-gray-600", // Gray
    };

    return colorMap[cell.adjacentMines] || "";
  };

  // Get cell background class
  const getCellBgClass = () => {
    if (cell.isRevealed) {
      if (cell.isMine) return "cell-mine";
      return "cell-revealed";
    }
    if (cell.isFlagged) return "cell-flagged";
    return "cell-unrevealed";
  };

  return (
    <motion.button
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      disabled={gameOver && !cell.isRevealed}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center font-bold",
        "text-lg leading-none",
        "focus:ring-2 focus:ring-blue-500 focus:outline-none",
        getCellBgClass(),
        getCellColor(),
      )}
      style={{
        borderRadius: "var(--cell-border-radius)",
        fontFamily: "Arial, sans-serif",
      }}
      // Minimal animation for retro feel
      initial={false}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      whileTap={
        !cell.isRevealed && !gameOver
          ? {
              scale: 0.98,
              transition: { duration: 0.05 },
            }
          : {}
      }
      transition={{
        duration: 0.1,
      }}
    >
      <AnimatePresence mode="wait">
        {cell.isRevealed ? (
          // Revealed content with scale animation
          <motion.div
            key="revealed"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            className="relative z-10"
          >
            {getCellContent()}
          </motion.div>
        ) : cell.isFlagged ? (
          // Flagged with flip animation
          <motion.div
            key="flagged"
            initial={{ rotateY: -180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 180, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className="relative z-10"
          >
            🚩
          </motion.div>
        ) : (
          // Unrevealed empty state
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
});

Cell.displayName = "Cell";

export default Cell;
