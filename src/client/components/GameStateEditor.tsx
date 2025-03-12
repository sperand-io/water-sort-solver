import type { GameState } from '@/types';
import { getAvailableColors, getColorHex } from '@/utils';
import React, { useEffect, useState } from 'react';
import VialVisualizer from './VialVisualizer';

interface GameStateEditorProps {
  gameState: GameState | null;
  onChange: (newState: GameState) => void;
  onSolve: () => void;
  isLoading: boolean;
}

// Maximum vial capacity
const MAX_VIAL_CAPACITY = 4;

const GameStateEditor: React.FC<GameStateEditorProps> = ({ 
  gameState, 
  onChange, 
  onSolve,
  isLoading
}) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [localState, setLocalState] = useState<GameState>({ vials: [] });
  const [jsonMode, setJsonMode] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Initialize with empty vials or from provided state
  useEffect(() => {
    if (gameState) {
      setLocalState(gameState);
      setJsonInput(JSON.stringify(gameState, null, 2));
    } else if (localState.vials.length === 0) {
      // Start with 7 empty vials by default
      setLocalState({
        vials: Array(7).fill([]).map(() => [])
      });
    }
  }, [gameState]);

  // Update JSON input when local state changes
  useEffect(() => {
    setJsonInput(JSON.stringify(localState, null, 2));
  }, [localState]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleVialClick = (vialIndex: number, position: number) => {
    if (!selectedColor) return;

    const newVials = [...localState.vials.map(vial => [...vial])];
    const vial = [...newVials[vialIndex]];

    // Clicked on an existing color or an empty space
    if (position >= vial.length) {
      // Adding to the top of the vial
      if (vial.length < MAX_VIAL_CAPACITY) {
        vial.push(selectedColor);
      }
    } else {
      // Replace a color at a specific position
      vial[position] = selectedColor;
    }

    newVials[vialIndex] = vial;
    const newState = { vials: newVials };
    setLocalState(newState);
    onChange(newState);
  };

  const handleVialClear = (vialIndex: number) => {
    const newVials = [...localState.vials.map(vial => [...vial])];
    newVials[vialIndex] = [];
    const newState = { vials: newVials };
    setLocalState(newState);
    onChange(newState);
  };

  const handleAddVial = () => {
    const newVials = [...localState.vials.map(vial => [...vial]), []];
    const newState = { vials: newVials };
    setLocalState(newState);
    onChange(newState);
  };

  const handleRemoveVial = () => {
    if (localState.vials.length <= 1) return;
    const newVials = localState.vials.slice(0, -1).map(vial => [...vial]);
    const newState = { vials: newVials };
    setLocalState(newState);
    onChange(newState);
  };

  const toggleJsonMode = () => {
    setJsonMode(!jsonMode);
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    setJsonError(null);
  };

  const applyJsonChanges = () => {
    try {
      const parsed = JSON.parse(jsonInput) as GameState;
      
      // Basic validation
      if (!parsed.vials || !Array.isArray(parsed.vials)) {
        throw new Error('Invalid JSON: missing vials array');
      }
      
      // Validate each vial
      parsed.vials.forEach((vial, index) => {
        if (!Array.isArray(vial)) {
          throw new Error(`Invalid vial at index ${index}: not an array`);
        }
        
        if (vial.length > MAX_VIAL_CAPACITY) {
          throw new Error(`Vial at index ${index} exceeds maximum capacity (${MAX_VIAL_CAPACITY})`);
        }
        
        vial.forEach((color, colorIndex) => {
          if (typeof color !== 'string') {
            throw new Error(`Invalid color at vial ${index}, position ${colorIndex}`);
          }
        });
      });
      
      setLocalState(parsed);
      onChange(parsed);
      setJsonError(null);
    } catch (error) {
      console.error('JSON parsing error:', error);
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON format');
    }
  };

  return (
    <div>
      {/* Mode toggle */}
      <div className="mb-4">
        <button
          onClick={toggleJsonMode}
          className="px-4 py-2 border rounded-md text-sm font-medium transition-colors bg-gray-50 hover:bg-gray-100"
        >
          {jsonMode ? 'Switch to Visual Editor' : 'Switch to JSON Editor'}
        </button>
      </div>

      {jsonMode ? (
        <div className="space-y-4">
          <textarea
            value={jsonInput}
            onChange={handleJsonChange}
            className="w-full h-64 font-mono text-sm p-3 border rounded-md"
            placeholder="Edit the JSON representation of the game state"
          />
          
          {jsonError && (
            <div className="text-red-500 text-sm">
              {jsonError}
            </div>
          )}
          
          <button
            onClick={applyJsonChanges}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Apply Changes
          </button>
        </div>
      ) : (
        <div>
          {/* Color palette */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Color Palette</h3>
            <div className="flex flex-wrap gap-2">
              {getAvailableColors().map(colorName => (
                <button
                  key={colorName}
                  onClick={() => handleColorSelect(colorName)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    selectedColor === colorName 
                      ? 'ring-2 ring-offset-2 ring-blue-500 shadow-md' 
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: getColorHex(colorName) }}
                  title={colorName}
                />
              ))}
            </div>
          </div>

          {/* Vials display */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Vials</h3>
              <div className="space-x-2">
                <button
                  onClick={handleAddVial}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                >
                  Add Vial
                </button>
                <button
                  onClick={handleRemoveVial}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                  disabled={localState.vials.length <= 1}
                >
                  Remove Vial
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {localState.vials.map((vial, vialIndex) => (
                <div key={vialIndex} className="flex flex-col items-center">
                  <VialVisualizer 
                    vial={vial}
                    onLayerClick={(position) => handleVialClick(vialIndex, position)}
                    interactive={true}
                  />
                  <div className="mt-2 text-center">
                    <div className="text-gray-700 font-medium mb-1">Vial {vialIndex + 1}</div>
                    <button
                      onClick={() => handleVialClear(vialIndex)}
                      className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Solve button */}
      <div className="mt-6">
        <button
          onClick={onSolve}
          disabled={isLoading || localState.vials.length === 0}
          className={`w-full py-2 rounded-md transition-colors font-medium ${
            isLoading || localState.vials.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Solving...' : 'Solve Puzzle'}
        </button>
      </div>
    </div>
  );
};

export default GameStateEditor;