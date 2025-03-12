import { useSolver } from '@/client/hooks/useSolver';
import { GameState } from '@/types';
import React from 'react';
import GameStateEditor from './GameStateEditor';
import ImageUploader from './ImageUploader';
import SolutionViewer from './SolutionViewer';

const SolverPage: React.FC = () => {
  const { 
    gameState, 
    solution, 
    isLoading, 
    error, 
    solvePuzzle, 
    analyzeImage, 
    isStrictMode,
    updateGameState,
    toggleStrictMode,
    reset
  } = useSolver({strictMode: true});

  const handleImageAnalysis = async (imageBase64: string, fileType: string) => {
    await analyzeImage(imageBase64, fileType);
  };

  const handleSolve = async () => {
    if (!gameState) return;
    await solvePuzzle(gameState);
  };

  const handleGameStateChange = (newState: GameState) => {
    updateGameState(newState);
  };

  const handleStrictModeChange = () => {
    toggleStrictMode();
    reset();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <section className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Upload Puzzle Image</h2>
            <ImageUploader onImageUpload={handleImageAnalysis} isLoading={isLoading} />
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Game State Editor</h2>
            <div className="mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isStrictMode}
                  onChange={handleStrictModeChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">
                  Strict Mode - Ensure each color is fully consolidated in one vial
                </span>
              </label>
              <p className="text-gray-500 text-sm mt-1 ml-7">
                When enabled, the solver will continue until each color appears in exactly one vial and is filled to capacity.
              </p>
            </div>
            
            <GameStateEditor 
              gameState={gameState} 
              onChange={handleGameStateChange} 
              onSolve={handleSolve}
              isLoading={isLoading}
            />
            
            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
              </div>
            )}
          </section>
        </div>

        <div>
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Solution</h2>
            <SolutionViewer 
              gameState={gameState} 
              solution={solution}
              isLoading={isLoading}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default SolverPage;