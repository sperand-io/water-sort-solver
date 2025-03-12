/**
 * Utility functions for handling colors
 */

// Color mapping
const COLOR_MAP: Record<string, string> = {
  'red': '#FF0000',
  'green': '#2ecc71',
  'blue': '#3498db',
  'yellow': '#f1c40f',
  'orange': '#e67e22',
  'purple': '#9b59b6',
  'cyan': '#00FFFF'
};

/**
 * Get hex color code from color name
 * @param colorName Name of the color
 * @returns Hex color code
 */
export function getColorHex(colorName: string): string {
  return COLOR_MAP[colorName.toLowerCase()] || '#000000';
}

/**
 * Get contrasting text color (black or white) for a given background color
 * @param bgColor Background color in hex format
 * @returns Text color (black or white)
 */
export function getContrastColor(bgColor: string): string {
  // Remove # if present
  const hex = bgColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for bright colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Check if a color name is valid
 * @param colorName Name of the color
 * @returns True if the color is recognized
 */
export function isValidColor(colorName: string): boolean {
  return !!COLOR_MAP[colorName.toLowerCase()];
}

/**
 * Get a list of all available colors
 * @returns Array of color names
 */
export function getAvailableColors(): string[] {
  return Object.keys(COLOR_MAP);
}