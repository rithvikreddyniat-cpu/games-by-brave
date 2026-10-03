// Entry Point for Snake Noir — The Unprinted Panel
import '../css/style.css';
import { Game } from './game.js';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.startLoop();
  
  console.log('SNAKE NOIR Engine initialized successfully.');
});
