// Type definitions shared between client and server

import type { Anthropic } from '@anthropic-ai/sdk';

export type Color = string;
export type Vial = Color[];

export interface GameState {
  vials: Vial[];
}

export interface Move {
  from: number;
  to: number;
}

export interface MoveWithColor {
  from: number;
  to: number;
  color: string;
  units: number;
}

export interface SolverResult {
  moves: MoveWithColor[];
  success: boolean;
  message?: string;
}

export interface CloudData {
  id: string;
  gameState: GameState;
  solution?: SolverResult;
  created: string;
}

// Claude API response
export interface ClaudeAnalysisResult {
  success: boolean;
  gameState?: GameState;
  error?: string;
}

export interface HONO_BINDINGS {
  ANTHROPIC_API_KEY: string;

}

// Add this to support the anthropic client in the Hono context
export interface AnthropicHonoEnv {
  Bindings: HONO_BINDINGS;
  Variables: {
    anthropic: Anthropic;
  };
}