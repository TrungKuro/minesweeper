import { useState, useCallback } from "react";

/**
 * Custom hook for managing localStorage with TypeScript type safety
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to local storage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  // Remove the key from localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Highscore entry type
 */
export interface HighscoreEntry {
  name: string;
  time: number; // in seconds
  date: string; // ISO string
}

/**
 * Highscores organized by difficulty
 */
export interface Highscores {
  BEGINNER: HighscoreEntry[];
  INTERMEDIATE: HighscoreEntry[];
  EXPERT: HighscoreEntry[];
  CUSTOM: HighscoreEntry[];
}

const HIGHSCORES_KEY = "minesweeper:highscores";

/**
 * Hook for managing highscores in localStorage
 */
export function useHighscores() {
  const [highscores, setHighscores] = useLocalStorage<Highscores>(
    HIGHSCORES_KEY,
    {
      BEGINNER: [],
      INTERMEDIATE: [],
      EXPERT: [],
      CUSTOM: [],
    },
  );

  const saveHighscore = useCallback(
    (
      difficulty: keyof Highscores,
      entry: HighscoreEntry,
      maxEntries: number = 10,
    ) => {
      setHighscores((prev) => {
        const difficultyScores = [...(prev[difficulty] || [])];

        // Add new entry
        difficultyScores.push(entry);

        // Sort by time (ascending - fastest times first)
        difficultyScores.sort((a, b) => a.time - b.time);

        // Keep only top N scores
        const topScores = difficultyScores.slice(0, maxEntries);

        return {
          ...prev,
          [difficulty]: topScores,
        };
      });
    },
    [setHighscores],
  );

  const getHighscores = useCallback(
    (difficulty: keyof Highscores): HighscoreEntry[] => {
      return highscores[difficulty] || [];
    },
    [highscores],
  );

  const clearHighscores = useCallback(
    (difficulty?: keyof Highscores) => {
      if (difficulty) {
        setHighscores((prev) => ({
          ...prev,
          [difficulty]: [],
        }));
      } else {
        setHighscores({
          BEGINNER: [],
          INTERMEDIATE: [],
          EXPERT: [],
          CUSTOM: [],
        });
      }
    },
    [setHighscores],
  );

  return {
    highscores,
    saveHighscore,
    getHighscores,
    clearHighscores,
  };
}
