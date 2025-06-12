/**
 * Simple Cursor Manager
 * Handles the cursor display in the terminal using a simple underscore approach
 */

import { eventBus } from '../utils/events.js';
import { TERMINAL_EVENTS } from './terminal-events.js';

class CursorManager {
  constructor() {
    this.inputElement = null;
    this.cursorElement = null;
    this.blinkInterval = null;
    this.isVisible = false;
    this.animationFrameId = null;

    // A hidden span for accurate text width measurement using the DOM
    this.measurementSpan = null;
  }

  initialize(inputElement, cursorElement) {
    if (!inputElement || !cursorElement) {
      console.error('[CursorManager] Missing required elements for initialization.');
      return;
    }

    this.inputElement = inputElement;
    this.cursorElement = cursorElement;

    // --- DOM-based Measurement Setup ---
    this.measurementSpan = document.createElement('span');
    // Style the span to be invisible and off-screen
    this.measurementSpan.style.visibility = 'hidden';
    this.measurementSpan.style.position = 'absolute';
    this.measurementSpan.style.whiteSpace = 'pre'; // Preserve spaces for measurement
    this.measurementSpan.style.left = '-9999px';

    // Critically, copy the exact font styles from the input to the span
    const computedStyle = getComputedStyle(this.inputElement);
    this.measurementSpan.style.font = computedStyle.font;
    this.measurementSpan.style.letterSpacing = computedStyle.letterSpacing;
    this.measurementSpan.style.padding = '0';
    this.measurementSpan.style.margin = '0';
    this.measurementSpan.style.border = 'none';

    document.body.appendChild(this.measurementSpan);

    this.setupEventListeners();
    this.startBlinking();
    this.updatePosition(); // Start the position update loop

    console.log('[CursorManager] Initialized with robust DOM-based measurement.');
  }

  updatePosition() {
    if (!this.inputElement || !this.measurementSpan) return;

    // Get the text content up to the caret position
    const textBeforeCursor = this.inputElement.value.substring(0, this.inputElement.selectionStart);

    // Use the measurement span to get the exact rendered width of the text
    this.measurementSpan.textContent = textBeforeCursor;
    const textWidth = this.measurementSpan.offsetWidth;

    // Adjust position based on the input's horizontal scroll and offsetLeft
    const newLeft = textWidth - this.inputElement.scrollLeft + this.inputElement.offsetLeft;
    this.cursorElement.style.left = `${newLeft}px`;

    // Override CSS bottom and vertically center the cursor
    this.cursorElement.style.bottom = 'auto';
    const inputHeight = this.inputElement.clientHeight;
    const cursorHeight = this.cursorElement.offsetHeight;
    const newTop = (inputHeight - cursorHeight) / 2;
    this.cursorElement.style.top = `${newTop}px`;

    // Continue the update loop
    this.animationFrameId = requestAnimationFrame(() => this.updatePosition());
  }

  startBlinking() {
    if (this.blinkInterval) clearInterval(this.blinkInterval);

    this.blinkInterval = setInterval(() => {
      const hasSelection = this.inputElement.selectionStart !== this.inputElement.selectionEnd;
      const isFocused = document.activeElement === this.inputElement;

      if (isFocused && !hasSelection) {
        // Blink when focused and no text is selected
        this.isVisible = !this.isVisible;
        this.cursorElement.style.display = this.isVisible ? 'block' : 'none';
      } else {
        // Hide cursor if blurred or text is selected
        this.isVisible = false;
        this.cursorElement.style.display = 'none';
      }
    }, 500);
  }

  destroy() {
    // Stop all intervals and animation frames to prevent leaks
    if (this.blinkInterval) clearInterval(this.blinkInterval);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    
    this.blinkInterval = null;
    this.animationFrameId = null;

    // Hide the cursor element
    if (this.cursorElement) {
      this.cursorElement.style.display = 'none';
    }

    // IMPORTANT: Remove the measurement span from the DOM to prevent memory leaks
    if (this.measurementSpan && this.measurementSpan.parentNode) {
      this.measurementSpan.parentNode.removeChild(this.measurementSpan);
    }
    this.measurementSpan = null;

    console.log('[CursorManager] Destroyed and cleaned up resources.');
  }

  setupEventListeners() {
    if (!this.inputElement) return;

    this.inputElement.addEventListener('focus', () => {
      this.isVisible = true;
      this.cursorElement.style.display = 'block';
      if (!this.animationFrameId) {
        this.updatePosition();
      }
    });

    this.inputElement.addEventListener('blur', () => {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.isVisible = false;
      this.cursorElement.style.display = 'none';
    });
  }
}

// Export the class for use in other modules
export default CursorManager;
