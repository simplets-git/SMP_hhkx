/**
 * Terminal
 * 
 * Main terminal class that integrates core, view, and controller components.
 * This implements the facade pattern to provide a simple interface to the terminal.
 */

import { eventBus } from '../utils/events.js';
import { TERMINAL_EVENTS } from './terminal-events.js';
import terminalCore from './terminal-core.js';
import terminalView from './terminal-view.js';
import terminalController from './terminal-controller.js';
import InputHandler from './input-handler.js';

class Terminal {
  constructor() {
    // Component references
    this.core = terminalCore;
    this.view = terminalView;
    this.controller = terminalController;
    
    // Input handler
    this.inputHandler = null;
    
    // State
    this.initialized = false;
  }

  /**
   * Initialize the terminal
   * @returns {Object} Terminal instance
   */
  initialize() {
    if (this.initialized) {
      console.log('Terminal already initialized');
      return this;
    }

    console.log('Initializing terminal...');
    
    try {
      // Create input handler first so it's available when view needs it
      console.log('[Terminal] Creating input handler');
      this.inputHandler = new InputHandler();
      
      // Initialize terminal components
      this.core.initialize();
      // Show password prompt initially
      this.core.config.greetings = 'Please enter the password:';
      this.core.setPrompt('Password: ');
      this.view.initialize(); 
      
      // After view init, wait for input element before finishing setup
      const finishInit = () => {
        this.controller.initialize();
        this.setupEventListeners();
        this.initialized = true;
        console.log('Terminal initialized successfully');
        eventBus.emit(TERMINAL_EVENTS.TERMINAL_INITIALIZED, this);
      };
      
      if (this.view.inputElement) {
        this.inputHandler.initialize(this.view.inputElement);
        finishInit();
      } else {
        eventBus.once('terminal:input:element:ready', (inputEl) => {
          this.inputHandler.initialize(inputEl);
          finishInit();
        });
      }
      return this;
    } catch (error) {
      console.error('Error initializing terminal:', error);
      alert('Error initializing terminal: ' + error.message);
      return this;
    }
  }

  /**
   * Set up event listeners for the terminal
   */
  setupEventListeners() {
    // Listen for terminal resize events
    window.addEventListener('resize', () => {
      this.handleResize();
    });
    
    // Listen for terminal events
    eventBus.on(TERMINAL_EVENTS.CLEAR, () => {
      this.view.clear();
    });
    
    // Listen for input element ready event
    console.log('[Terminal] Setting up listener for terminal:input:element:ready event');
    eventBus.on('terminal:input:element:ready', (inputElement) => {
      console.log('[Terminal] Received terminal:input:element:ready event with input element');
      if (inputElement) {
        console.log('[Terminal] Initializing input handler with received input element');
        if (this.inputHandler) {
          this.inputHandler.initialize(inputElement);
        } else {
          console.error('[Terminal] ERROR: Input handler not available when input element is ready');
        }
      } else {
        console.error('[Terminal] ERROR: Received terminal:input:element:ready event with null/undefined input element');
      }
    });
    
    // Listen for theme changes
    eventBus.on('theme:changed', () => {
      // Cursor color is now handled by CSS text color. No manual update needed.
      // if (this.view.cursorManager) {
      //   this.view.cursorManager.updateCursorColor(); // This method no longer exists
      // }
    });
    
    // Handle command execution events from UI buttons
    document.addEventListener('command:execute', (event) => {
      if (event.detail && event.detail.command) {
        this.core.executeCommand(event.detail.command);
      }
    });
  }

  /**
   * Handle terminal resize
   */
  handleResize() {
    // Cursor position is now handled by text flow. No manual update needed on resize.
    // if (this.view.cursorManager) {
    //   this.view.cursorManager.updateCursorPosition(); // This method no longer exists
    // }
  }

  /**
   * Update the terminal theme
   * @param {Object} themeOptions - Theme options (no longer needed with CSS variables)
   */
  updateTheme(themeOptions) {
    // No need to manually set styles - CSS variables handle this now
    // Just update the cursor color which may need JavaScript handling
    if (this.view.cursorManager) {
      this.view.cursorManager.updateCursorColor();
    }
  }

  /**
   * Refresh the terminal display
   */
  refresh() {
    // Update cursor position without forcing reflow
    if (this.view.cursorManager) {
      this.view.cursorManager.updateCursorPosition();
    }
  }

  /**
   * Clear the terminal
   */
  clear() {
    eventBus.emit(TERMINAL_EVENTS.CLEAR);
  }

  /**
   * Write output to the terminal
   * @param {*} output - Output to write
   */
  write(output) {
    this.view.displayOutput(output);
  }

  /**
   * Execute a command programmatically
   * @param {string} command - Command to execute
   */
  executeCommand(command) {
    if (!command) return;
    
    // Emit command execution event
    eventBus.emit(TERMINAL_EVENTS.EXECUTE, command);
  }

  /**
   * Set the terminal prompt
   * @param {string} prompt - New prompt text
   */
  setPrompt(prompt) {
    this.core.setPrompt(prompt);
  }

  /**
   * Get the command history
   * @returns {string[]} Command history array
   */
  getCommandHistory() {
    return this.core.getCommandHistory();
  }

  /**
   * Updates the target input element for the InputHandler.
   * @param {HTMLElement} newInputElement - The new input element to target.
   */
  updateInputHandlerTarget(newInputElement) {
    console.log('[Terminal] updateInputHandlerTarget called with element:', newInputElement ? 'valid element' : 'null');
    
    if (!newInputElement) {
      console.error('[Terminal] ERROR: Attempted to update input handler with null/undefined element');
      return;
    }
    
    if (!this.inputHandler) {
      console.log('[Terminal] Input handler not yet created, creating now');
      this.inputHandler = new InputHandler();
    }
    
    if (typeof this.inputHandler.initialize === 'function') {
      console.log('[Terminal] Initializing input handler with input element');
      this.inputHandler.initialize(newInputElement);
    } else {
      console.error('[Terminal] ERROR: Input handler has no initialize method');
    }
  }
}

// Create singleton instance
const terminal = new Terminal();

export default terminal;
