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

    if (cell.isMine) return "text-red-600 dark:text-red-400";

    // Color coding for numbers with enhanced contrast
    const colorMap: Record<number, string> = {
      1: "text-blue-600 dark:text-blue-400",
      2: "text-green-600 dark:text-green-400",
      3: "text-red-600 dark:text-red-400",
      4: "text-purple-600 dark:text-purple-400",
      5: "text-yellow-600 dark:text-yellow-400",
      6: "text-cyan-600 dark:text-cyan-400",
      7: "text-black dark:text-white",
      8: "text-gray-700 dark:text-gray-300",
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
        "cell-glossy relative flex h-10 w-10 items-center justify-center text-sm font-bold",
        "rounded-lg border border-white/20",
        "focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:outline-none",
        getCellBgClass(),
        getCellColor(),
      )}
      // Reveal animation: scale from 0.95 to 1 with fade-in
      initial={false}
      animate={
        cell.isRevealed
          ? {
              scale: 1,
              opacity: 1,
              rotateX: 0,
            }
          : {
              scale: 1,
              opacity: 1,
              rotateX: 0,
            }
      }
      whileHover={
        !cell.isRevealed && !gameOver
          ? {
              scale: 1.05,
              transition: { duration: 0.2 },
            }
          : {}
      }
      whileTap={
        !cell.isRevealed && !gameOver
          ? {
              scale: 0.95,
              transition: { duration: 0.1 },
            }
          : {}
      }
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
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
