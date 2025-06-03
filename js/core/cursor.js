/**
 * Simple Cursor Manager
 * Handles the cursor display in the terminal using a simple underscore approach
 */

import { eventBus } from '../utils/events.js';
import { TERMINAL_EVENTS } from './terminal-events.js';

class CursorManager {
  constructor() {
    this.inputElement = null;
    this.blinkInterval = null;
    this.cursorChar = '_';
    this.isVisible = true;
    this.originalValue = '';
    this.cursorPosition = 0;
  }

  /**
   * Initialize the cursor manager
   * @param {HTMLElement} inputLineElement - The input line container (not used in this implementation)
   * @param {HTMLElement} inputElement - The input element
   */
  initialize(inputLineElement, inputElement) {
    if (!inputElement) {
      console.error('[CursorManager] Missing required input element');
      return;
    }

    // Clean up any previous state
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }

    this.inputElement = inputElement;
    
    // Ensure we start with a clean input value (no cursor characters)
    if (this.inputElement.value.includes(this.cursorChar)) {
      this.inputElement.value = this.inputElement.value.replace(new RegExp(this.cursorChar, 'g'), '');
    }
    this.originalValue = this.inputElement.value;
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Focus the input element
    this.inputElement.focus();
    
    // Start cursor blinking with a slight delay to ensure everything is ready
    setTimeout(() => {
      this.startBlinking();
    }, 100);
    
    console.log('[CursorManager] Initialized with simple underscore cursor');
  }
  
  /**
   * Update the cursor display based on input value and selection
   */
  updateCursor() {
    if (!this.inputElement) return;
    
    // First, ensure we're working with the original value (no cursor characters)
    this.restoreOriginalText();
    
    // Get current selection and value after restoration
    const selStart = this.inputElement.selectionStart;
    const selEnd = this.inputElement.selectionEnd;
    const value = this.inputElement.value;
    
    // Store the current position for reference
    this.cursorPosition = selStart;
    
    // Only update if we're not in the middle of a selection
    if (selStart === selEnd) {
      // Store the original value without cursor
      this.originalValue = value;
      
      if (this.isVisible) {
        // Insert the cursor character at the selection point
        const newValue = value.substring(0, selStart) + this.cursorChar + value.substring(selStart);
        this.inputElement.value = newValue;
        
        // Restore the selection position (accounting for the added cursor character)
        this.inputElement.selectionStart = selStart;
        this.inputElement.selectionEnd = selStart;
      }
    }
  }
  
  /**
   * Restore the original text without the cursor character
   */
  restoreOriginalText() {
    if (this.inputElement && this.originalValue !== undefined) {
      const currentPos = this.cursorPosition;
      this.inputElement.value = this.originalValue;
      
      // Restore the cursor position
      this.inputElement.selectionStart = currentPos;
      this.inputElement.selectionEnd = currentPos;
    }
  }
  
  /**
   * Start the cursor blinking animation
   */
  startBlinking() {
    // Clear any existing interval
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
    }
    
    // Set the cursor to visible initially
    this.isVisible = true;
    this.updateCursor();
    
    // Start the blink interval
    this.blinkInterval = setInterval(() => {
      // Toggle visibility
      this.isVisible = !this.isVisible;
      
      if (this.isVisible) {
        // Show the cursor
        this.updateCursor();
      } else {
        // Hide the cursor (restore original text)
        this.restoreOriginalText();
      }
    }, 500); // Blink every 500ms
  }
  
  /**
   * Stop the cursor blinking animation
   */
  stopBlinking() {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }
    
    // Restore the original text when stopping
    this.restoreOriginalText();
  }
  
  /**
   * Show the cursor and focus the input
   */
  show() {
    if (this.inputElement) {
      this.inputElement.focus();
    }
    
    this.isVisible = true;
    this.updateCursor();
    
    // Restart blinking
    this.startBlinking();
  }
  
  /**
   * Hide the cursor
   */
  hide() {
    this.isVisible = false;
    this.restoreOriginalText();
    
    // Stop blinking
    this.stopBlinking();
  }
  
  /**
   * Set up event listeners for cursor
   */
  setupEventListeners() {
    if (!this.inputElement) return;
    
    // Handle input changes
    this.inputElement.addEventListener('input', (event) => {
      // Due to the 'keydown' listener calling restoreOriginalText(),
      // this.inputElement.value should now be the "true" text after browser's input processing.
      this.originalValue = this.inputElement.value;
      this.cursorPosition = this.inputElement.selectionStart;

      // updateCursor() will handle re-inserting the visual cursor if this.isVisible is true.
      // It internally calls restoreOriginalText() first (which is fine, it will use the new originalValue)
      // and then adds the cursorChar.
      this.updateCursor();
    });
    
    // Handle key events
    this.inputElement.addEventListener('keydown', (event) => {
      // For special keys like arrows, we need to restore the original text
      // to allow the browser to handle the navigation correctly
      this.restoreOriginalText();
      
      // After the key event is processed, update the cursor
      setTimeout(() => {
        this.updateCursor();
      }, 0);
    });
    
    // Handle click events
    this.inputElement.addEventListener('click', () => {
      // The click moves the browser's caret. Our input field might still visually contain our old cursor character.
      // First, restoreOriginalText() to remove our visual artifact based on the *old* state.
      this.restoreOriginalText();

      // Use setTimeout to ensure the browser has updated the selection state after the click.
      setTimeout(() => {
        // Now the field is clean. Read the new cursor position set by the click.
        this.originalValue = this.inputElement.value; // Value is already clean from restoreOriginalText
        this.cursorPosition = this.inputElement.selectionStart; // Get the new position
        
        // Redraw the visual cursor at the new position.
        this.updateCursor();
      }, 0);
    });
    
    // Handle focus events
    this.inputElement.addEventListener('focus', () => {
      this.show();
    });
    
    // Handle blur events
    this.inputElement.addEventListener('blur', () => {
      this.hide();
    });
    
    // Handle theme changes
    eventBus.on('theme:changed', () => {
      // No action needed for this implementation
    });
    
    // Handle cursor updates
    eventBus.on(TERMINAL_EVENTS.CURSOR_UPDATE, () => {
      this.updateCursor();
    });
  }
}

// Export the class for use in other modules
export default CursorManager;
