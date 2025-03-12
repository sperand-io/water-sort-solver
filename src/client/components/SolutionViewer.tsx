import type { GameState, MoveWithColor, SolverResult, Vial } from '@/types';
import { getColorHex } from '@/utils';
import React, { useEffect, useState } from 'react';
import VialVisualizer from './VialVisualizer';

interface SolutionViewerProps {
  gameState: GameState | null;
  solution: SolverResult | null;
  isLoading: boolean;
}

const SolutionViewer: React.FC<SolutionViewerProps> = ({ 
  gameState, 
  solution, 
  isLoading 
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [vialStates, setVialStates] = useState<Vial[][]>([]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1000); // ms between steps

  // Reset when game state or solution changes
  useEffect(() => {
    setCurrentStep(0);
    setIsAnimating(false);
    
    if (gameState && solution?.success) {
      generateVialStates(gameState.vials, solution.moves);
    } else {
      setVialStates([]);
    }
  }, [gameState, solution]);

  // Generate all intermediate vial states
  const generateVialStates = (initialVials: Vial[], moves: MoveWithColor[]) => {
    const states: Vial[][] = [initialVials];
    let currentVials = JSON.parse(JSON.stringify(initialVials));
    
    for (const move of moves) {
      // Apply the move
      const sourceVial = currentVials[move.from];
      const destVial = currentVials[move.to];
      
      // Move units from source to destination
      for (let i = 0; i < move.units; i++) {
        destVial.push(sourceVial.pop());
      }
      
      // Add the new state
      states.push(JSON.parse(JSON.stringify(currentVials)));
    }
    
    setVialStates(states);
  };

  // Handle animation
  useEffect(() => {
    let animationTimer: ReturnType<typeof setTimeout>;
    
    if (isAnimating && currentStep < vialStates.length - 1) {
      animationTimer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, animationSpeed);
    } else if (isAnimating && currentStep >= vialStates.length - 1) {
      setIsAnimating(false);
    }
    
    return () => {
      clearTimeout(animationTimer);
    };
  }, [isAnimating, currentStep, vialStates, animationSpeed]);

  const handlePlayPause = () => {
    setIsAnimating(!isAnimating);
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsAnimating(false);
    }
  };

  const handleStepForward = () => {
    if (currentStep < vialStates.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsAnimating(false);
    }
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert from 1-5 to milliseconds (slower to faster)
    const speed = parseInt(e.target.value);
    setAnimationSpeed(2000 - (speed * 400)); // 1600ms to 0ms
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsAnimating(false);
  };

  if (!gameState) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Upload an image or set up your puzzle to see the solution</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
        <p className="text-gray-600">Finding solution...</p>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Click "Solve Puzzle" to find a solution</p>
      </div>
    );
  }

  if (!solution.success || vialStates.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 mx-auto text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-600 font-medium">{solution.message || 'No solution found'}</p>
        <p className="text-gray-500 mt-2">Try adjusting the puzzle state and solve again</p>
      </div>
    );
  }

  // Show the solution
  const currentVials = vialStates[currentStep];
  const currentMove = currentStep > 0 ? solution.moves[currentStep - 1] : null;

  return (
    <div>
      {/* Solution success header */}
      <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-700 font-medium">
            Solution found in {solution.moves.length} moves!
          </span>
        </div>
      </div>

      {/* Current move display */}
      {currentMove && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="font-medium mb-1">Move {currentStep} of {solution.moves.length}</div>
          <div className="flex items-center">
            <span>Pour</span>
            <div 
              className="mx-2 w-5 h-5 rounded inline-block" 
              style={{ backgroundColor: getColorHex(currentMove.color) }}
            ></div>
            <span className="font-medium">{currentMove.units} {currentMove.color}</span>
            <span className="mx-2">from Vial {currentMove.from + 1} to Vial {currentMove.to + 1}</span>
          </div>
        </div>
      )}

      {/* Vials visualization */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">
          {currentStep === 0 
            ? 'Initial State' 
            : currentStep === vialStates.length - 1
              ? 'Final State'
              : `State After Move ${currentStep}`
          }
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {currentVials.map((vial, index) => (
            <div key={index} className="flex flex-col items-center">
              <VialVisualizer 
                vial={vial} 
                highlight={
                  currentMove ? (index === currentMove.from || index === currentMove.to) : undefined
                }
              />
              <div className="mt-2 text-center text-gray-700 font-medium">
                Vial {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animation controls */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleStepBack}
            disabled={currentStep === 0}
            className={`p-2 rounded ${
              currentStep === 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={handlePlayPause}
            className="p-2 rounded text-gray-700 hover:bg-gray-100"
          >
            {isAnimating ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          
          <button 
            onClick={handleStepForward}
            disabled={currentStep === vialStates.length - 1}
            className={`p-2 rounded ${
              currentStep === vialStates.length - 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <button 
            onClick={handleReset}
            className="p-2 rounded text-gray-700 hover:bg-gray-100 ml-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Speed</span>
          <input 
            type="range" 
            min="1" 
            max="5" 
            value={(2000 - animationSpeed) / 400}
            onChange={handleSpeedChange} 
            className="w-24"
          />
        </div>
      </div>

      {/* Show all moves */}
      <div className="mt-8">
        <h3 className="font-medium mb-3">All Moves</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {solution.moves.map((move, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border ${
                index === currentStep - 1 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3">
                  {index + 1}
                </span>
                <span>Pour</span>
                <div 
                  className="mx-2 w-4 h-4 rounded inline-block" 
                  style={{ backgroundColor: getColorHex(move.color) }}
                ></div>
                <span className="font-medium">{move.units} {move.color}</span>
                <span className="mx-2">from Vial {move.from + 1} to Vial {move.to + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SolutionViewer;