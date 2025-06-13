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
    console.log('[CursorManager] Initializing. inputElement.value received:', `"${this.inputElement.value}"`, 'Setting originalValue to:', `"${this.originalValue}"`);
    
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
   * Synchronize the cursor manager's state with a new input value.
   * This is typically used when the input value is set programmatically.
   * @param {string} newValueFromInputHandler - The new value for the input field.
   */
  syncWithValue(newValueFromInputHandler) {
    if (!this.inputElement) return;

    const wasBlinking = !!this.blinkInterval;
    if (wasBlinking) {
      // Stop blinking. This internally calls restoreOriginalText(), which sets
      // inputElement.value to the *current* this.originalValue before this sync.
      this.stopBlinking();
    }

    // Now, inputElement.value might have been reset by stopBlinking -> restoreOriginalText.
    // We must definitively set it to the new value from the input handler.
    this.inputElement.value = newValueFromInputHandler;
    this.originalValue = newValueFromInputHandler; // Update internal state to the new source of truth

    // Ensure the browser's actual cursor position is within the bounds of the new value.
    // If selectionStart was beyond the new length (e.g., previous text was longer),
    // move it to the end of the new value.
    if (this.inputElement.selectionStart > newValueFromInputHandler.length) {
      this.inputElement.selectionStart = newValueFromInputHandler.length;
      this.inputElement.selectionEnd = newValueFromInputHandler.length;
    }
    // Update our internal cursor position tracking.
    this.cursorPosition = this.inputElement.selectionStart;

    // Refresh the visual cursor display based on the new state.
    // updateCursor() will use the new this.originalValue and this.cursorPosition.
    // It first calls restoreOriginalText (which is now safe as originalValue is current)
    // and then adds the visual cursor character if isVisible is true.
    this.updateCursor();

    if (wasBlinking) {
      this.startBlinking(); // Restart blinking. startBlinking itself calls updateCursor initially.
    } else {
      // If not blinking (e.g., input was blurred and re-focused programmatically),
      // ensure the cursor is visibly updated if the input element is the active one.
      if (document.activeElement === this.inputElement) {
        this.isVisible = true; // Assume it should be visible if focused
        this.updateCursor(); // Ensure the visual cursor character is present
      }
    }
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
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
        // For keys other than history navigation, restore text to allow normal browser handling
        // and then schedule a cursor update after the browser has processed the key.
        this.restoreOriginalText();
        setTimeout(() => {
          this.updateCursor();
        }, 0);
      }
      // For ArrowUp/ArrowDown, InputHandler.setValue() will change the input value.
      // This triggers CursorManager's 'input' event listener, which is responsible for
      // updating originalValue and calling updateCursor(). No further action related to
      // cursor updates is needed from this keydown listener for these specific keys.
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
