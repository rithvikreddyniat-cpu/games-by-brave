// Entry Point for Snake Noir — The Unprinted Panel
import '@fontsource/bebas-neue';
import '@fontsource/special-elite';
import '../css/style.css';
import { Game } from './game.js';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.startLoop();
  
  console.log('SNAKE NOIR Engine initialized successfully.');
});
