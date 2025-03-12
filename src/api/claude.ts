import type { ClaudeAnalysisResult, GameState } from '@/types';
import type { Anthropic } from '@anthropic-ai/sdk';
import type { TextBlock } from '@anthropic-ai/sdk/resources/messages.mjs';
/**
 * Analyzes a Water Sort puzzle image using Claude
 * @param imageBase64 Base64 encoded image
 * @param anthropic Anthropic client instance
 * @returns Analysis result with game state
 */
export async function analyzeImage(
  imageBase64: string,
  fileType: 'png' | 'jpg' | 'jpeg',
  anthropic: Anthropic
): Promise<ClaudeAnalysisResult> {
  try {
    // Construct the prompt for Claude
    const prompt = `
I need to extract the game state from this Water Sort puzzle screenshot. 

Please analyze the vials in the image and identify the colors in each vial, from bottom to top. Use simple color names like: red, green, blue, yellow, orange, purple, cyan, pink, brown, gray.

Important:
- Don't conflate similar colors (particularly distinguish between blue and cyan)
- Only include the colors that are actually present
- List colors from BOTTOM to TOP for each vial, but
- DO NOT pad the vial with hallucinated colors — if they're partially full, only list the colors actually present
- Empty vials should be represented as empty arrays
- Possible colors: red, green, blue, yellow, orange, purple, cyan

Present your response in this exact JSON format ONLY, with no additional text:

\`\`\`json
{
  "vials": [
    ["color1", "color2", "color3", "color4"],
    ["color1", "color2"],
    []
  ]
}
\`\`\`

Where the first array represents vial 1, the second represents vial 2, and so on, working from left to right, top to bottom in the image.
`;

    // Call Claude API with the provided client
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
                data: imageBase64
              }
            }
          ]
        }
      ]
    });

    // Extract JSON from Claude's response
    const { text }  = response.content[0] as TextBlock;;
    const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/) || 
                      text.match(/{[\s\S]*?}/);
                      
    if (!jsonMatch) {
      return {
        success: false,
        error: 'Could not extract valid JSON from Claude response'
      };
    }

    // Parse the JSON
    const jsonContent = jsonMatch[1] || jsonMatch[0];
    const gameState = JSON.parse(jsonContent) as GameState;

    // Validate the structure
    if (!gameState.vials || !Array.isArray(gameState.vials)) {
      return {
        success: false,
        error: 'Invalid game state structure: missing vials array'
      };
    }

    return {
      success: true,
      gameState
    };
  } catch (error) {
    console.error('Claude API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error analyzing image'
    };
  }
}