import type { Color, Move, MoveWithColor, Vial } from '@/types';

// Constants
const MAX_VIAL_CAPACITY = 4;
const MAX_SEARCH_STATES = 1000000; // Limit search space for performance

/**
 * Game state representation
 */
class GameState {
  vials: Vial[];
  moves: Move[];

  constructor(vials: Vial[], moves: Move[] = []) {
    this.vials = vials.map(v => [...v]); // Deep copy
    this.moves = [...moves];
  }

  /**
   * Create a string representation for state comparison
   */
  toString(): string {
    return this.vials.map(vial => vial.join(',')).join('|');
  }

  /**
   * Create a deep clone of this state
   */
  clone(): GameState {
    return new GameState(
      this.vials.map(vial => [...vial]),
      [...this.moves]
    );
  }
}

/**
 * Count total number of each color in the puzzle
 */
function getTotalColorCounts(vials: Vial[]): Record<string, number> {
  const colorCounts: Record<string, number> = {};
  for (const vial of vials) {
    for (const color of vial) {
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    }
  }
  return colorCounts;
}

/**
 * Check if a state is solved according to the rules
 */
function isSolved(state: GameState, strictMode: boolean): boolean {
  // Basic check: each vial contains only one color or is empty
  const basicCheck = state.vials.every(vial => 
    vial.length === 0 || vial.every(color => color === vial[0])
  );
  
  if (!basicCheck) return false;
  
  // If not in strict mode, the basic check is sufficient
  if (!strictMode) return true;
  
  // Strict mode: Each color must be in exactly one vial and filled to capacity
  const colorCounts = getTotalColorCounts(state.vials);
  const colorLocations: Record<string, number> = {};
  
  for (let i = 0; i < state.vials.length; i++) {
    const vial = state.vials[i];
    if (vial.length === 0) continue;
    
    const color = vial[0];
    
    // If we've already seen this color in another vial
    if (colorLocations[color] !== undefined) {
      return false; // Color appears in multiple vials
    }
    
    colorLocations[color] = i;
  }
  
  // Check that each vial with a color has the maximum possible amount
  for (const [color, totalCount] of Object.entries(colorCounts)) {
    const vialIndex = colorLocations[color];
    if (vialIndex === undefined) continue; // Skip if color has no location (shouldn't happen)
    
    const vial = state.vials[vialIndex];
    
    // In strict mode, the vial should have either the max capacity or the total count
    // of this color, whichever is smaller
    const expectedCount = Math.min(totalCount, MAX_VIAL_CAPACITY);
    if (vial.length !== expectedCount) {
      return false; // Vial doesn't have the maximum possible amount
    }
  }
  
  return true;
}

/**
 * Get the topmost color sequence from a vial
 */
function getTopColorSequence(vial: Vial): { color: Color, count: number } | null {
  if (vial.length === 0) return null;
  
  const topColor = vial[vial.length - 1];
  let count = 0;
  
  for (let i = vial.length - 1; i >= 0; i--) {
    if (vial[i] === topColor) {
      count++;
    } else {
      break;
    }
  }
  
  return { color: topColor, count };
}

/**
 * Check if a move is valid
 */
function isValidMove(state: GameState, from: number, to: number): boolean {
  const sourceVial = state.vials[from];
  const destVial = state.vials[to];
  
  // Can't pour from empty vial
  if (sourceVial.length === 0) return false;
  
  // Can't pour to self
  if (from === to) return false;
  
  // Can't pour to full vial
  if (destVial.length >= MAX_VIAL_CAPACITY) return false;
  
  // Can pour to empty vial
  if (destVial.length === 0) return true;
  
  // Can pour only if top colors match
  const sourceTop = sourceVial[sourceVial.length - 1];
  const destTop = destVial[destVial.length - 1];
  
  return sourceTop === destTop;
}

/**
 * Execute a move and return the new state
 */
function executeMove(state: GameState, from: number, to: number): GameState {
  if (!isValidMove(state, from, to)) {
    throw new Error("Invalid move");
  }
  
  const newState = state.clone();
  const sourceVial = newState.vials[from];
  const destVial = newState.vials[to];
  
  const topSequence = getTopColorSequence(sourceVial);
  if (!topSequence) return newState;
  
  // Calculate how many units we can pour
  const spaceInDest = MAX_VIAL_CAPACITY - destVial.length;
  const unitsToPour = Math.min(topSequence.count, spaceInDest);
  
  // Pour the units
  for (let i = 0; i < unitsToPour; i++) {
    destVial.push(sourceVial.pop()!);
  }
  
  // Record the move
  newState.moves.push({ from, to });
  
  return newState;
}

/**
 * Generate all possible next states
 */
function generateNextStates(state: GameState): GameState[] {
  const nextStates: GameState[] = [];
  
  for (let from = 0; from < state.vials.length; from++) {
    for (let to = 0; to < state.vials.length; to++) {
      if (isValidMove(state, from, to)) {
        const newState = executeMove(state, from, to);
        nextStates.push(newState);
      }
    }
  }
  
  return nextStates;
}

/**
 * Solve the water sort puzzle using BFS
 */
export function solvePuzzle(initialVials: Vial[], strictMode: boolean = true): MoveWithColor[] | null {
  // Create initial state
  const initialState = new GameState(initialVials);
  
  // Already solved?
  if (isSolved(initialState, strictMode)) {
    return [];
  }
  
  // BFS algorithm
  const queue: GameState[] = [initialState];
  const visited = new Set<string>();
  visited.add(initialState.toString());
  
  let statesExplored = 0;
  
  while (queue.length > 0 && statesExplored < MAX_SEARCH_STATES) {
    const currentState = queue.shift()!;
    statesExplored++;
    
    const nextStates = generateNextStates(currentState);
    
    for (const nextState of nextStates) {
      const stateStr = nextState.toString();
      
      if (!visited.has(stateStr)) {
        if (isSolved(nextState, strictMode)) {
          // Convert moves to MoveWithColor format
          return enrichMoves(nextState.moves, initialVials);
        }
        
        visited.add(stateStr);
        queue.push(nextState);
      }
    }
  }
  
  return null; // No solution found or search limit reached
}

/**
 * Enriches moves with color and unit information
 */
function enrichMoves(moves: Move[], initialVials: Vial[]): MoveWithColor[] {
  const result: MoveWithColor[] = [];
  const currentVials = initialVials.map(vial => [...vial]); // Deep copy
  
  for (const move of moves) {
    const { from, to } = move;
    const sourceVial = currentVials[from];
    
    if (sourceVial.length === 0) {
      continue; // Shouldn't happen, but skip if it does
    }
    
    const topColor = sourceVial[sourceVial.length - 1];
    
    // Count consecutive same colors from top
    let count = 0;
    for (let i = sourceVial.length - 1; i >= 0; i--) {
      if (sourceVial[i] === topColor) {
        count++;
      } else {
        break;
      }
    }
    
    // Calculate actual units poured
    const destVial = currentVials[to];
    const spaceInDest = MAX_VIAL_CAPACITY - destVial.length;
    const unitsToPour = Math.min(count, spaceInDest);
    
    // Record the enriched move
    result.push({
      from,
      to,
      color: topColor,
      units: unitsToPour
    });
    
    // Update the vials state for the next move
    for (let i = 0; i < unitsToPour; i++) {
      destVial.push(sourceVial.pop()!);
    }
  }
  
  return result;
}