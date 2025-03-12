import type { ClaudeAnalysisResult, GameState, SolverResult } from '@/types';
import { useState } from 'react';

/**
 * Hook for working with the Water Sort Puzzle solver API
 */
export function useSolver({strictMode = true}: {strictMode?: boolean} = {}) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [solution, setSolution] = useState<SolverResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStrictMode, setIsStrictMode] = useState(strictMode);

  const apiUrl = import.meta.env.VITE_API_URL || '/api';

  const toggleStrictMode = () => {
    setIsStrictMode(!isStrictMode);
  };

  /**
   * Solve a puzzle based on the game state
   */
  const solvePuzzle = async (state: GameState) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiUrl}/solve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          gameState: state,
          strictMode: isStrictMode
        }),
      });
      
      const result = await response.json() as SolverResult;
      setSolution(result);
      
      if (!result.success) {
        setError(result.message || 'Could not find a solution');
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error solving puzzle';
      setError(message);
      setSolution(null);
      
      return {
        success: false,
        moves: [],
        message
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Analyze an image using Claude
   */
  const analyzeImage = async (imageBase64: string, fileType: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64, fileType }),
      });
      const result = await response.json() as ClaudeAnalysisResult;
      
      if (!result.success) {
        setError(result.error || 'Failed to analyze image');
        return null;
      }
      
      setGameState(result.gameState!);
      return result.gameState;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error analyzing image';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update the game state
   */
  const updateGameState = (newState: GameState) => {
    setGameState(newState);
    // Reset solution when game state changes
    setSolution(null);
  };

  /**
   * Reset all state
   */
  const reset = () => {
    setGameState(null);
    setSolution(null);
    setError(null);
  };

  return {
    // State
    gameState,
    solution,
    isLoading,
    error,
    isStrictMode,
    // Methods
    solvePuzzle,
    analyzeImage,
    updateGameState,
    reset,
    toggleStrictMode
  };
}