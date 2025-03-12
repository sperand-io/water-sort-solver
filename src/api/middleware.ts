import type { AnthropicHonoEnv } from '@/types';
import { Anthropic } from '@anthropic-ai/sdk';
import type { MiddlewareHandler } from 'hono';

export const anthropicMiddleware: MiddlewareHandler<AnthropicHonoEnv> = async (c, next) => {
  // Initialize Anthropic client with API key from env
  const apiKey = c.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return c.json({ error: 'Anthropic API key is not set' }, 500);
  }
  
  c.set('anthropic', new Anthropic({
    apiKey
  }));
  
  await next();
}; 