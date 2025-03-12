import type { Color, Move, MoveWithColor, Vial } from '@/types';

// Constants
const MAX_VIAL_CAPACITY = 4;
const MAX_SEARCH_STATES = 100000; // Limit search space for performance

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
  return vials.reduce((counts, vial) => {
    return vial.reduce((vialCounts, color) => {
      vialCounts[color] = (vialCounts[color] || 0) + 1;
      return vialCounts;
    }, counts);
  }, {} as Record<string, number>);
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
  if (!strictMode) return true;
  
  // Get non-empty vials with their indices
  const nonEmptyVials = state.vials
    .map((vial, index) => ({ vial, index }))
    .filter(({ vial }) => vial.length > 0);
  
  // Check for duplicate colors across vials
  const colorToVial = new Map<Color, number>();
  const hasUniqueColors = nonEmptyVials.every(({ vial, index }) => {
    const color = vial[0];
    if (colorToVial.has(color)) return false;
    colorToVial.set(color, index);
    return true;
  });
  
  if (!hasUniqueColors) return false;
  
  // Check that each color fills its vial appropriately
  const colorCounts = getTotalColorCounts(state.vials);
  return [...colorToVial.entries()].every(([color, vialIndex]) => {
    const vial = state.vials[vialIndex];
    const expectedCount = Math.min(colorCounts[color], MAX_VIAL_CAPACITY);
    return vial.length === expectedCount;
  });
}

/**
 * Get the topmost color sequence from a vial
 */
function getTopColorSequence(vial: Vial): { color: Color, count: number } | null {
  if (vial.length === 0) return null;
  
  const topColor = vial[vial.length - 1];
  const count = [...vial]
    .reverse()
    .reduce((count, color) => 
      color === topColor ? count + 1 : count,
      0
    );
    
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
  
  const sourceVial = state.vials[from];
  const destVial = state.vials[to];
  
  const topSequence = getTopColorSequence(sourceVial);
  if (!topSequence) return state.clone();
  
  // Calculate how many units we can pour
  const spaceInDest = MAX_VIAL_CAPACITY - destVial.length;
  const unitsToPour = Math.min(topSequence.count, spaceInDest);
  
  // Create new vials array with updated source and destination
  const newVials = state.vials.map((vial, index) => {
    if (index === from) {
      return vial.slice(0, -unitsToPour);
    }
    if (index === to) {
      return [...vial, ...vial.slice(-unitsToPour).fill(topSequence.color)];
    }
    return [...vial];
  });
  
  return new GameState(
    newVials,
    [...state.moves, { from, to }]
  );
}

/**
 * Generate all possible next states
 */
function generateNextStates(state: GameState): GameState[] {
  return Array.from({ length: state.vials.length })
    .flatMap((_, from) => 
      Array.from({ length: state.vials.length })
        .map((_, to) => ({ from, to }))
    )
    .filter(({ from, to }) => isValidMove(state, from, to))
    .map(({ from, to }) => executeMove(state, from, to));
}

/**
 * Solve the water sort puzzle using BFS
 */
export function solvePuzzle(initialVials: Vial[], strictMode: boolean = true): MoveWithColor[] | null {
  const initialState = new GameState(initialVials);
  if (isSolved(initialState, strictMode)) return [];

  /**
   * Process a single state in the BFS search:
   * - Generate all possible next states
   * - Filter out already visited states
   * - Find first solution state (if any)
   * - Add valid states to queue for further exploration
   */
  const processState = (
    state: GameState,
    visited: Set<string>,
    queue: GameState[]
  ): MoveWithColor[] | null => {
    const solution = generateNextStates(state)
      // Only consider states we haven't seen before
      .filter(nextState => !visited.has(nextState.toString()))
      // Find first state that leads to a solution
      .find(nextState => {
        const stateStr = nextState.toString();
        // Mark as visited and queue for exploration (same as original impl)
        visited.add(stateStr);
        queue.push(nextState);
        return isSolved(nextState, strictMode);
      });

    // Convert solution state to enriched moves if found
    return solution 
      ? enrichMoves(solution.moves, initialVials)
      : null;
  };

  // Initialize BFS data structures
  const queue: GameState[] = [initialState];
  const visited = new Set<string>([initialState.toString()]);
  let statesExplored = 0;

  // Main BFS loop - same logic as original
  while (queue.length > 0 && statesExplored < MAX_SEARCH_STATES) {
    const currentState = queue.shift()!;
    statesExplored++;

    const solution = processState(currentState, visited, queue);
    if (solution) return solution;
  }

  return null; // No solution found within search limits
}

/**
 * Enriches moves with color and unit information
 */
function enrichMoves(moves: Move[], initialVials: Vial[]): MoveWithColor[] {
  // Process each move, tracking both the enriched moves and current vial state
  return moves.reduce<{
    moves: MoveWithColor[],
    vials: Vial[]
  }>(({ moves, vials }, { from, to }) => {
    const sourceVial = vials[from];
    
    // Skip invalid moves (shouldn't happen)
    if (sourceVial.length === 0) {
      return { moves, vials };
    }
    
    const topColor = sourceVial[sourceVial.length - 1];
    
    // Count consecutive same colors from top
    const count = [...sourceVial]
      .reverse()
      .reduce((count, color) => 
        color === topColor ? count + 1 : count,
        0
      );
    
    // Calculate actual units poured
    const destVial = vials[to];
    const spaceInDest = MAX_VIAL_CAPACITY - destVial.length;
    const unitsToPour = Math.min(count, spaceInDest);
    
    // Create new vials array with updated source and destination
    const newVials = vials.map((vial, index) => {
      if (index === from) {
        return vial.slice(0, -unitsToPour);
      }
      if (index === to) {
        return [...vial, ...Array(unitsToPour).fill(topColor)];
      }
      return vial;
    });
    
    // Return updated state with new move
    return {
      moves: [...moves, { from, to, color: topColor, units: unitsToPour }],
      vials: newVials
    };
  }, {
    moves: [],
    vials: initialVials.map(vial => [...vial])
  }).moves;
}