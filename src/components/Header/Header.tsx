import React, { useEffect, useState } from "react";
import { GameState, GameStatus, Difficulty } from "@/types/game";

interface HeaderProps {
  state: GameState;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onRestart: () => void;
}

/**
 * Header component showing game stats and controls
 */
const Header: React.FC<HeaderProps> = ({
  state,
  onDifficultyChange,
  onRestart,
}) => {
  const [liveTimerSeconds, setLiveTimerSeconds] = useState(0);

  // Timer logic - only update state when game is actively playing
  useEffect(() => {
    if (state.status !== GameStatus.PLAYING) {
      return;
    }

    // Game is playing - start timer
    const interval = setInterval(() => {
      if (state.startTime) {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        setLiveTimerSeconds(elapsed);
      }
    }, 100); // Update every 100ms for smooth display

    return () => clearInterval(interval);
  }, [state.status, state.startTime]);

  // Derive timer value from state instead of storing in local state
  const timerSeconds = (() => {
    if (state.status === GameStatus.PLAYING && state.startTime) {
      return liveTimerSeconds;
    } else if (state.startTime && state.endTime) {
      // Game finished - show final time
      return Math.floor((state.endTime - state.startTime) / 1000);
    } else {
      // Game idle or no time recorded
      return 0;
    }
  })();

  // Calculate remaining mines (total mines - flags placed)
  const remainingMines = state.mines - state.flagsPlaced;

  // Get status emoji
  const getStatusEmoji = () => {
    switch (state.status) {
      case GameStatus.WON:
        return "😎";
      case GameStatus.LOST:
        return "😵";
      case GameStatus.PLAYING:
        return "😊";
      default:
        return "🙂";
    }
  };

  return (
    <div
      className="mb-4 flex flex-col gap-4 bg-gray-300 p-4 dark:bg-gray-700"
      style={{
        border: "3px solid",
        borderColor: "#ffffff #808080 #808080 #ffffff",
        borderRadius: "2px",
      }}
    >
      {/* Top row: Timer, Restart, Mine Counter */}
      <div className="flex items-center justify-between gap-4">
        {/* Mine Counter */}
        <div
          className="flex min-w-[80px] items-center justify-center bg-black px-3 py-2 font-mono text-2xl font-bold text-red-600"
          style={{
            border: "2px inset #808080",
            borderRadius: "2px",
          }}
        >
          {remainingMines.toString().padStart(3, "0")}
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="bg-gray-300 px-4 py-2 text-3xl active:bg-gray-400 dark:bg-gray-600 dark:active:bg-gray-500"
          style={{
            border: "3px solid",
            borderColor: "#ffffff #808080 #808080 #ffffff",
            borderRadius: "2px",
          }}
          aria-label="Restart game"
        >
          {getStatusEmoji()}
        </button>

        {/* Timer */}
        <div
          className="flex min-w-[80px] items-center justify-center bg-black px-3 py-2 font-mono text-2xl font-bold text-red-600"
          style={{
            border: "2px inset #808080",
            borderRadius: "2px",
          }}
        >
          {timerSeconds.toString().padStart(3, "0")}
        </div>
      </div>

      {/* Bottom row: Difficulty selector */}
      <div className="flex items-center justify-center gap-2">
        <label
          htmlFor="difficulty"
          className="font-bold text-gray-800 dark:text-gray-200"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          Difficulty:
        </label>
        <select
          id="difficulty"
          value={state.difficulty}
          onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
          className="bg-white px-3 py-1 font-semibold text-gray-900 focus:outline-none dark:bg-gray-800 dark:text-gray-100"
          style={{
            border: "2px solid #808080",
            borderRadius: "2px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <option value={Difficulty.BEGINNER}>Beginner (9×9, 10 mines)</option>
          <option value={Difficulty.INTERMEDIATE}>
            Intermediate (16×16, 40 mines)
          </option>
          <option value={Difficulty.EXPERT}>Expert (16×30, 99 mines)</option>
        </select>
      </div>

      {/* Status message */}
      {state.status === GameStatus.WON && (
        <div
          className="text-center text-lg font-bold text-green-700 dark:text-green-400"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          🎉 You won in {timerSeconds} seconds! 🎉
        </div>
      )}
      {state.status === GameStatus.LOST && (
        <div
          className="text-center text-lg font-bold text-red-700 dark:text-red-400"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          💥 Game Over! Try again! 💥
        </div>
      )}
    </div>
  );
};

export default Header;
