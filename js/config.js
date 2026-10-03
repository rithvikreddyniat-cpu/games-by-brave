// Game Constants & Configuration

export const GAME_STATES = {
  TITLE: 'TITLE',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER'
};

export const DIRECTIONS = {
  UP: { x: 0, y: -1, name: 'UP' },
  DOWN: { x: 0, y: 1, name: 'DOWN' },
  LEFT: { x: -1, y: 0, name: 'LEFT' },
  RIGHT: { x: 1, y: 0, name: 'RIGHT' }
};

// Opposite direction map to prevent instant self-reversals
export const OPPOSITE_DIRECTIONS = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT'
};

export const CONFIG = {
  GRID_COLS: 20,
  GRID_ROWS: 20,
  CELL_SIZE: 36, // Logical canvas internal dimensions: 720px x 720px
  INITIAL_SNAKE_LENGTH: 5,
  TICK_INTERVAL_MS: 120, // Milliseconds per grid move
  
  // Theme styling colors for Renderer
  COLORS: {
    BACKGROUND: '#0a0a0e',
    GRID_LINE: 'rgba(245, 243, 235, 0.08)',
    PANEL_BORDER: '#f5f3eb',
    SNAKE_HEAD: '#f5f3eb',
    SNAKE_BODY: '#c2bfb5',
    SNAKE_OUTLINE: '#08080a',
    SNAKE_EYE: '#08080a',
    TRAIL_GLOW: 'rgba(245, 243, 235, 0.15)'
  }
};
