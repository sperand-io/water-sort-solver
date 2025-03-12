import type { AnthropicHonoEnv, SolverResult } from '@/types';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { analyzeImage } from './claude';
import { anthropicMiddleware } from './middleware';
import { solvePuzzle } from './solver';

// Create API router
export const apiRouter = new Hono<AnthropicHonoEnv>();

// Schema for the solve request
const solveSchema = z.object({
  gameState: z.object({
    vials: z.array(z.array(z.string()))
  }),
  strictMode: z.boolean().default(true)
});

// Schema for image analysis request
const imageAnalysisSchema = z.object({
  imageBase64: z.string().min(1),
  fileType: z.enum(['png', 'jpg', 'jpeg'])
});

// Health check endpoint
apiRouter.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Solve puzzle endpoint
apiRouter.post('/solve', zValidator('json', solveSchema), async (c) => {
  const { gameState, strictMode } = c.req.valid('json');
  
  try {
    const solution = solvePuzzle(gameState.vials, strictMode);
    
    if (!solution) {
      return c.json<SolverResult>({
        success: false, 
        moves: [],
        message: 'No solution found. The puzzle may be unsolvable or too complex.'
      }, 200);
    }
    
    return c.json<SolverResult>({
      success: true,
      moves: solution
    }, 200);
  } catch (error) {
    console.error('Solver error:', error);
    return c.json<SolverResult>({
      success: false,
      moves: [],
      message: error instanceof Error ? error.message : 'Unknown error solving puzzle'
    }, 500);
  }
});

// Analyze image with Claude
apiRouter.post(
  '/analyze-image', 
  anthropicMiddleware,
  zValidator('json', imageAnalysisSchema), 
  async (c) => {
    const { imageBase64, fileType } = c.req.valid('json');
    console.log('fileType', fileType);
    try {
      const result = await analyzeImage(imageBase64, fileType, c.get('anthropic'));
      return c.json(result, 200);
    } catch (error) {
      console.error('Claude API error:', error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze image'
      }, 500);
    }
  }
);