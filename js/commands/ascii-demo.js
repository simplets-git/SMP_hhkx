// ASCII Art Video Demo Command
// Plays a simple ASCII animation in the terminal area
import CommandRegistry from './registry.js';

// Simple spinner frames (you can replace with more complex ASCII frames)
const FRAMES = [
  `   \\
    |
   /`,
  `   |
   /
  /`,
  `   /
  / |
 /`,
  `   -
  |
   -`,
  `   /\
   |
   \\`,
  `   -
   |
   -`,
];

const FRAME_DELAY = 120; // ms per frame
const TOTAL_LOOPS = 8;   // how many times to loop the animation

/**
 * Handler for the ascii-demo command
 * @param {string} commandString - Full command string
 * @param {object} context - Terminal context (optional)
 * @returns {Promise<string>} - Resolves when animation is done
 */
async function handleAsciiDemo(commandString, context) {
  // Get terminalView via CommandRegistry (singleton import)
  const terminalView = (window.terminalView || (await import('../core/terminal-view.js')).default);
  // Hide input during animation
  if (terminalView && terminalView.inputElement) {
    terminalView.inputElement.disabled = true;
  }

  // Print intro
  if (terminalView) terminalView.displayOutput('Playing ASCII animation demo...');

  // Animation loop
  for (let loop = 0; loop < TOTAL_LOOPS; ++loop) {
    for (let i = 0; i < FRAMES.length; ++i) {
      const frame = FRAMES[i];
      if (terminalView) {
        // Overwrite last frame or append if first
        if (loop === 0 && i === 0) {
          terminalView.displayOutput(`<pre>${frame}</pre>`);
        } else {
          // Remove last frame
          const outputs = terminalView.outputElement.querySelectorAll('pre');
          if (outputs.length > 0) outputs[outputs.length - 1].remove();
          terminalView.displayOutput(`<pre>${frame}</pre>`);
        }
      }
      // Wait for next frame
      await new Promise(res => setTimeout(res, FRAME_DELAY));
    }
  }

  // Remove last frame
  if (terminalView) {
    const outputs = terminalView.outputElement.querySelectorAll('pre');
    if (outputs.length > 0) outputs[outputs.length - 1].remove();
    // Show done message
    terminalView.displayOutput('ASCII animation demo complete!');
    // Re-enable input
    if (terminalView.inputElement) terminalView.inputElement.disabled = false;
    // Restore prompt
    if (window.terminal && window.terminal.setPrompt) window.terminal.setPrompt(window.terminal.core.config.prompt);
    // Focus input
    if (terminalView.inputElement) terminalView.inputElement.focus();
  }
  return '';
}

export { handleAsciiDemo };
