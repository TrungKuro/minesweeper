"use client";

import React, { useCallback } from "react";
import { Difficulty, GameState } from "@/types/game";
import { useGameReducer } from "@/hooks/useGameReducer";
import { useHighscores } from "@/hooks/useLocalStorage";
import Header from "@/components/Header/Header";
import Board from "@/components/Board/Board";

/**
 * Main Game component that orchestrates all game logic and UI
 */
const Game: React.FC = () => {
  const { saveHighscore } = useHighscores();

  // Win callback to save highscore
  const handleWin = useCallback(
    (state: GameState) => {
      if (state.startTime && state.endTime) {
        const timeInSeconds = Math.floor(
          (state.endTime - state.startTime) / 1000,
        );

        saveHighscore(state.difficulty, {
          name: "Anonymous",
          time: timeInSeconds,
          date: new Date().toISOString(),
        });
      }
    },
    [saveHighscore],
  );

  const { state, startNewGame, revealCell, toggleFlag, resetGame } =
    useGameReducer(Difficulty.BEGINNER, handleWin);

  const handleDifficultyChange = useCallback(
    (difficulty: Difficulty) => {
      startNewGame(difficulty);
    },
    [startNewGame],
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-100 to-purple-100 p-8">
      <div className="flex flex-col items-center">
        <h1 className="mb-6 text-4xl font-bold text-gray-800">Minesweeper</h1>

        <Header
          state={state}
          onDifficultyChange={handleDifficultyChange}
          onRestart={resetGame}
        />

        <Board
          state={state}
          onRevealCell={revealCell}
          onToggleFlag={toggleFlag}
        />

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Left click to reveal • Right click to flag</p>
        </div>
      </div>
    </div>
  );
};

export default Game;
