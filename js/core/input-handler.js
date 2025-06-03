/**
 * Input Handler
 * 
 * Handles user input for the terminal, including keyboard events,
 * command submission, and history navigation.
 */

import { eventBus } from '../utils/events.js';
import { TERMINAL_EVENTS } from './terminal-events.js';

class InputHandler {
  constructor() {
    // DOM elements
    this.inputElement = null;
    
    // State
    this.initialized = false;

    // Bound event handlers for proper removal
    this._boundKeyDown = null;
    this._boundInput = null;
    this._boundFocus = null;
    this._boundBlur = null;
    this._boundPaste = null;
  }

  /**
   * Initialize the input handler with an input element
   * @param {HTMLElement} inputElement - The input element to handle
   * @returns {Object} InputHandler instance
   */
  initialize(inputElement) {
    console.log('[InputHandler] Initializing with input element:', inputElement ? 'valid element' : 'null');
    
    if (!inputElement) {
      console.error('[InputHandler] ERROR: No input element provided for initialization');
      return this;
    }

    // If already initialized with a different element, clean up old listeners
    if (this.inputElement && this.inputElement !== inputElement) {
      this._removeEventListeners();
    }

    // Store reference to input element
    this.inputElement = inputElement;
    console.log('[InputHandler] Input element set:', this.inputElement.tagName, this.inputElement.className);

    // Bind event handlers if not already bound (e.g., first initialization)
    if (!this._boundKeyDown) {
      this._boundKeyDown = this.handleKeyDown.bind(this);
      this._boundInput = () => {
        if (this.inputElement) { // Ensure inputElement is still valid
          eventBus.emit(TERMINAL_EVENTS.CHANGED, this.inputElement.value);
        }
      };
      this._boundFocus = () => eventBus.emit(TERMINAL_EVENTS.FOCUS);
      this._boundBlur = () => eventBus.emit(TERMINAL_EVENTS.BLUR);
      this._boundPaste = this.handlePaste.bind(this);
    }
    
    // Set up event listeners on the new/current element
    this.setupEventListeners();
    
    if (!this.initialized) {
      console.log('Initializing input handler for the first time...');
      this.initialized = true;
      // Emit general initialization event only once
      eventBus.emit(TERMINAL_EVENTS.INPUT_INITIALIZED, this);
    }
    
    return this;
  }

  /**
   * Set up event listeners for the input handler
   */
  _removeEventListeners() {
    if (this.inputElement) {
      this.inputElement.removeEventListener('keydown', this._boundKeyDown);
      this.inputElement.removeEventListener('input', this._boundInput);
      this.inputElement.removeEventListener('focus', this._boundFocus);
      this.inputElement.removeEventListener('blur', this._boundBlur);
      this.inputElement.removeEventListener('paste', this._boundPaste);
    }
  }

  setupEventListeners() {
    console.log('[InputHandler] Setting up event listeners');
    
    if (!this.inputElement) {
      console.error('[InputHandler] ERROR: Cannot set up event listeners - no input element available');
      return;
    }
    
    // Ensure old listeners are removed before adding new ones to the current inputElement
    // This is implicitly handled by _removeEventListeners in initialize if element changes.
    // If setupEventListeners could be called independently, it would need its own _removeEventListeners call.

    try {
      console.log('[InputHandler] Adding keydown event listener');
      this.inputElement.addEventListener('keydown', this._boundKeyDown);
      
      console.log('[InputHandler] Adding input event listener');
      this.inputElement.addEventListener('input', this._boundInput);
      
      console.log('[InputHandler] Adding focus event listener');
      this.inputElement.addEventListener('focus', this._boundFocus);
      
      console.log('[InputHandler] Adding blur event listener');
      this.inputElement.addEventListener('blur', this._boundBlur);
      
      console.log('[InputHandler] Adding paste event listener');
      this.inputElement.addEventListener('paste', this._boundPaste);
      
      console.log('[InputHandler] All event listeners successfully attached');
      
      // Test focus to verify event listeners are working
      console.log('[InputHandler] Attempting to focus input element to test event listeners');
      setTimeout(() => {
        try {
          this.inputElement.focus();
          console.log('[InputHandler] Focus attempt completed');
        } catch (error) {
          console.error('[InputHandler] ERROR: Failed to focus input element:', error);
        }
      }, 100);
    } catch (error) {
      console.error('[InputHandler] ERROR: Failed to attach event listeners:', error);
    }
  }

  /**
   * Handle keydown events
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyDown(event) {
    console.log('[InputHandler] Key pressed:', event.key, 'KeyCode:', event.keyCode, 'Which:', event.which);
    switch (event.key) {
      case 'Enter':
        console.log('[InputHandler] Enter key detected - current input value:', this.inputElement ? this.inputElement.value : 'no input element');
        this.submitCommand();
        event.preventDefault();
        break;
        
      case 'ArrowUp':
        // Navigate history up
        eventBus.emit(TERMINAL_EVENTS.NAVIGATE, 'up');
        event.preventDefault();
        break;
        
      case 'ArrowDown':
        // Navigate history down
        eventBus.emit(TERMINAL_EVENTS.NAVIGATE, 'down');
        event.preventDefault();
        break;
        
      case 'Tab':
        // Auto-complete (to be implemented)
        event.preventDefault();
        break;
        
      case 'c':
        // Handle Ctrl+C
        if (event.ctrlKey) {
          this.handleCtrlC();
          event.preventDefault();
        }
        break;
        
      case 'l':
        // Handle Ctrl+L (clear terminal)
        if (event.ctrlKey) {
          eventBus.emit(TERMINAL_EVENTS.CLEAR);
          event.preventDefault();
        }
        break;
    }
  }

  /**
   * Submit the current command
   */
  submitCommand() {
    if (!this.inputElement) {
      console.error('[InputHandler] ERROR: No input element available for command submission');
      return;
    }
    
    const command = this.inputElement.value.trim();
    console.log('[InputHandler] Submitting command:', command);
    
    // Only emit if there's a command
    if (command) {
      console.log('[InputHandler] Emitting SUBMIT event for command:', command);
      try {
        // Check if eventBus is available
        if (!eventBus) {
          console.error('[InputHandler] ERROR: eventBus is undefined or null');
          return;
        }
        
        // Log event listeners for debugging
        console.log('[InputHandler] DEBUG: Current listeners for terminal:input:submit:', 
          eventBus._getListeners ? eventBus._getListeners('terminal:input:submit') : 'eventBus._getListeners not available');
        
        eventBus.emit('terminal:input:submit', command);
        console.log('[InputHandler] SUBMIT event emitted successfully');
      } catch (error) {
        console.error('[InputHandler] ERROR: Failed to emit SUBMIT event:', error);
      }
    } else {
      console.log('[InputHandler] No command to submit');
    }
    
    // Clear the input field AFTER emitting
    this.inputElement.value = '';
  }

  /**
   * Handle Ctrl+C
   */
  handleCtrlC() {
    // Clear the input field
    if (this.inputElement) {
      this.inputElement.value = '';
    }
    
    // Emit cancel event
    eventBus.emit(TERMINAL_EVENTS.CANCEL);
  }

  /**
   * Handle paste events
   * @param {ClipboardEvent} event - Clipboard event
   */
  handlePaste(event) {
    // Allow default paste behavior for now
    // This can be customized if needed
  }

  /**
   * Set the input value
   * @param {string} value - Value to set
   */
  setValue(value) {
    if (this.inputElement) {
      this.inputElement.value = value || '';
      
      // Emit change event
      eventBus.emit(TERMINAL_EVENTS.CHANGED, this.inputElement.value);
    }
  }

  /**
   * Get the current input value
   * @returns {string} Current input value
   */
  getValue() {
    return this.inputElement ? this.inputElement.value : '';
  }

  /**
   * Focus the input element
   */
  focus() {
    if (this.inputElement) {
      this.inputElement.focus();
    }
  }

  /**
   * Clear the input element
   */
  clear() {
    if (this.inputElement) {
      this.inputElement.value = '';
      
      // Emit change event
      eventBus.emit(TERMINAL_EVENTS.CHANGED, '');
    }
  }
}

export default InputHandler;
