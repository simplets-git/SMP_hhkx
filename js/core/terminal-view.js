/**
 * Terminal View
 * 
 * Handles rendering and display of the terminal interface.
 */

import { eventBus } from '../utils/events.js';
import { TERMINAL_EVENTS } from './terminal-events.js';
import CursorManager from './cursor.js';
import terminalCore from './terminal-core.js';

class TerminalView {
  constructor() {
    // DOM elements
    this.terminalElement = null;
    this.outputElement = null;
    this.inputElement = null;
    this.promptElement = null;
    
    // Cursor manager
    this.cursorManager = null;
    
    // State
    this.initialized = false;
  }

  /**
   * Initialize the terminal view
   * @returns {Object} Terminal view instance
   */
  initialize() {
    if (this.initialized) {
      console.log('Terminal view already initialized');
      return this;
    }

    try {
      console.log('Initializing terminal view...');
      
      // Get the terminal container
      this.terminalElement = document.getElementById('terminal');
      if (!this.terminalElement) {
        console.error('Terminal container not found');
        return this;
      }
      
      // Make sure the terminal is visible
      this.terminalElement.style.display = 'block';
      
      // Clear any existing content
      this.terminalElement.innerHTML = '';
      
      // Create terminal output container
      this.outputElement = document.createElement('div');
      this.outputElement.className = 'terminal-output';
      this.terminalElement.appendChild(this.outputElement);
      
      // Create input line
      this.createInputLine();
      
      // Show greeting
      this.showGreeting(terminalCore.getGreeting());
      
      // Focus the input
      this.inputElement.focus();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Mark as initialized
      this.initialized = true;
      
      // Remove loading class from body
      document.body.classList.remove('loading');
      
      // Hide loading screen
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
      }
      
      console.log('Terminal view initialized successfully');
      
      // Emit initialization event
      eventBus.emit(TERMINAL_EVENTS.VIEW_INITIALIZED, this);
      
      return this;
    } catch (error) {
      console.error('Error initializing terminal view:', error);
      alert('Error initializing terminal view: ' + error.message);
      return this;
    }
  }

  /**
   * Create the input line with prompt and input field
   * Only one input line should exist at a time.
   */
  createInputLine() {
    // Remove any existing input line (to avoid multiple active prompts)
    const oldInputLine = this.terminalElement.querySelector('.terminal-input-line');
    if (oldInputLine) {
      try {
        console.log('[DEBUG] Removing old input line:', oldInputLine);
      } catch (e) {}
      oldInputLine.remove();
    }
    // Create input line
    try {
      console.log('[DEBUG] Creating new input line');
    } catch (e) {}
    const inputLine = document.createElement('div');
    inputLine.className = 'terminal-input-line';
    // Create prompt
    this.promptElement = document.createElement('span');
    this.promptElement.className = 'terminal-prompt';
    this.promptElement.textContent = terminalCore.getPrompt();
    inputLine.appendChild(this.promptElement);
    // Create input field
    this.inputElement = document.createElement('input');
    this.inputElement.className = 'terminal-input';
    this.inputElement.type = 'text';
    this.inputElement.autocomplete = 'off';
    this.inputElement.spellcheck = false;
    inputLine.appendChild(this.inputElement);
    // Clear the input field's value before initializing the cursor for the new line
    this.inputElement.value = '';
    // Initialize the CursorManager with the custom underscore cursor
    this.cursorManager = new CursorManager();
    this.cursorManager.initialize(inputLine, this.inputElement);
    this.terminalElement.appendChild(inputLine);
    // Emit an event to notify that the input element is ready
    try {
      eventBus.emit('terminal:input:element:ready', this.inputElement);
    } catch (error) {
      console.error('[TerminalView] ERROR: Failed to emit INPUT_ELEMENT_READY event:', error);
    }
  }

  /**
   * Set up event listeners for the view
   */
  setupEventListeners() {
    // Listen for prompt changes
    eventBus.on(TERMINAL_EVENTS.PROMPT_CHANGED, (prompt) => {
      if (this.promptElement) {
        this.promptElement.textContent = prompt;
      }
    });
    
    // Listen for command output
    eventBus.on(TERMINAL_EVENTS.ADD, (output) => {
      this.displayOutput(output);
    });
    
    // Listen for clear command
    eventBus.on(TERMINAL_EVENTS.CLEAR, () => {
      this.clear();
    });
    
    // Listen for history navigation results
    eventBus.on(TERMINAL_EVENTS.ENTRY, (entry) => {
      if (this.inputElement) {
        this.inputElement.value = entry.command;
        
        // Move cursor to end of input
        setTimeout(() => {
          this.inputElement.selectionStart = this.inputElement.selectionEnd = this.inputElement.value.length;
        }, 0);
      }
    });
    
    // Handle terminal interactions with better text selection support
    this.setupSelectionHandling();
  }
  
  /**
   * Set up text selection handling for the terminal
   * This allows users to select and copy text from the terminal output
   */
  setupSelectionHandling() {
    // Helper function to check if text is currently selected
    const hasTextSelection = () => window.getSelection().toString().length > 0;
    
    // Click handler - only focus input if no text is selected
    this.terminalElement.addEventListener('click', (event) => {
      if (!hasTextSelection()) {
        this.inputElement.focus();
      } else {
        // Prevent default to maintain the selection
        event.preventDefault();
      }
    });
    
    // Mouseup handler - preserve selection for copy functionality
    this.terminalElement.addEventListener('mouseup', (event) => {
      if (hasTextSelection()) {
        event.preventDefault();
        // Let the browser's built-in copy functionality work
      }
    });
    
    // Add copy event support
    document.addEventListener('keydown', (event) => {
      // Check for Ctrl+C or Cmd+C (copy command)
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        if (hasTextSelection()) {
          // Let the browser handle the copy
          // No need to prevent default here
        }
      }
    });
  }

  /**
   * Show greeting message
   * @param {string} greeting - Greeting message
   */
  showGreeting(greeting) {
    if (!greeting) return;
    
    const greetingContainer = document.createElement('div');
    greetingContainer.className = 'welcome-message';
    greetingContainer.textContent = greeting;
    this.outputElement.appendChild(greetingContainer);
    
    // Add a spacer after the welcome message
    const spacer = document.createElement('div');
    spacer.className = 'welcome-spacer';
    this.outputElement.appendChild(spacer);
    
    // Force a reflow to ensure the spacer is rendered before the prompt
    this.outputElement.offsetHeight;
  }

  /**
   * Display command in the terminal as selectable text (prompt + user input)
   * @param {string} command - Command to display
   */
  displayCommand(command) {
    try {
      console.log('[DEBUG] displayCommand called with:', command);
    } catch (e) {}

    // Remove the input line before rendering the output line
    try {
      const oldInputLine = this.terminalElement.querySelector('.terminal-input-line');
      if (oldInputLine) {
        console.log('[DEBUG] Removing input line before rendering output:', oldInputLine);
        oldInputLine.remove();
      }
    } catch (e) {
      console.error('[DEBUG] Error removing input line:', e);
    }

    // Create a container for the command line
    const lineContainer = document.createElement('div');
    lineContainer.className = 'command-output';
    // Create a single span for the combined prompt and command
    const loggedCommandSpan = document.createElement('span');
    loggedCommandSpan.className = 'terminal-command terminal-user-input'; // Apply styles for inline display, pre-wrap, and selectability
    loggedCommandSpan.textContent = terminalCore.getPrompt() + command; // Combine prompt and command
    lineContainer.appendChild(loggedCommandSpan);
    this.outputElement.appendChild(lineContainer);
    return lineContainer;
  }

  /**
   * Display output in the terminal
   * @param {*} output - Output to display
   * @param {HTMLElement} container - Optional container to append to
   */
  displayOutput(output, container = null) {
    if (!output) return;
    
    const outputContainer = container || this.outputElement;
    
    const addOutput = (content, className = '') => {
      // Create a container for the output line
      const lineContainer = document.createElement('div');
      lineContainer.className = 'command-output' + (className ? ' ' + className : '');
      
      // Handle different content types
      if (typeof content === 'string') {
        // Preserve newlines in the output
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (index > 0) {
            // Add a line break for multi-line content
            lineContainer.appendChild(document.createElement('br'));
          }
          lineContainer.appendChild(document.createTextNode(line));
        });
      } else if (content instanceof HTMLElement) {
        lineContainer.appendChild(content);
      } else if (content && typeof content === 'object' && content.html) {
        lineContainer.innerHTML = content.html;
      } else {
        lineContainer.textContent = JSON.stringify(content);
      }
      
      // Add the line to the output container
      outputContainer.appendChild(lineContainer);
      
      // Ensure the output is visible
      this.scrollToBottom();
      
      return lineContainer;
    };
    
    try {
      // Handle different result types
      if (Array.isArray(output)) {
        // Handle array of results
        output.forEach(item => {
          if (typeof item === 'string') {
            addOutput(item);
          } else if (item && typeof item === 'object') {
            this.handleResultObject(item, addOutput);
          }
        });
      } else if (typeof output === 'string') {
        addOutput(output);
      } else if (output && typeof output === 'object') {
        this.handleResultObject(output, addOutput);
      }
      
      // Ensure the prompt is visible after adding output
      this.ensurePromptVisible();
    } catch (error) {
      console.error('Error displaying output:', error);
      addOutput(`Error displaying output: ${error.message}`, 'terminal-error');
    }
  }

  /**
   * Handle a result object in the display
   * @param {Object} item - The result object to handle
   * @param {Function} addOutput - Function to add output to the terminal
   */
  handleResultObject(item, addOutput) {
    if (item.error) {
      addOutput(item.error, 'terminal-error');
    } else if (item.text || item.message) {
      addOutput(item.text || item.message, item.className || '');
    } else if (item.type === 'html' || item.type === 'html_block' || item.html) {
      // Create a container for HTML content
      const container = document.createElement('div');
      container.className = item.className || '';
      container.innerHTML = item.html || item.message || item.content || '';
      
      // Execute any scripts in the HTML
      const scripts = container.getElementsByTagName('script');
      Array.from(scripts).forEach(script => {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        document.body.appendChild(newScript).parentNode.removeChild(newScript);
      });
      
      // Add the HTML content to the output
      addOutput(container);
    } else if (item.type === 'success') {
      addOutput(item.message || item.content || JSON.stringify(item), 'terminal-success');
    } else if (item.type === 'warning') {
      addOutput(item.message || item.content || JSON.stringify(item), 'terminal-warning');
    } else if (item.type === 'svg') {
      this.displaySvg(item.content || item.svg);
    } else {
      addOutput(JSON.stringify(item));
    }
  }

  /**
   * Display SVG content
   * @param {string} svgContent - SVG content to display
   */
  displaySvg(svgContent) {
    if (!svgContent) return;
    
    const container = document.createElement('div');
    container.className = 'terminal-svg-container';
    
    // Create a wrapper to control SVG colors through CSS
    const wrapper = document.createElement('div');
    wrapper.className = 'svg-theme-wrapper';
    wrapper.innerHTML = svgContent;
    
    // Add the wrapper to the container
    container.appendChild(wrapper);
    
    // Add the container to the output
    this.outputElement.appendChild(container);
    this.scrollToBottom();
  }

  /**
   * Ensure the prompt is visible and properly positioned
   */
  ensurePromptVisible() {
    // Force a reflow to ensure the DOM is updated
    this.outputElement.offsetHeight;
    
    // Scroll to the bottom to ensure the prompt is visible
    this.scrollToBottom();
    
    // Focus the input for the next command
    this.inputElement.focus();
  }

  /**
   * Clear the terminal
   */
  clear() {
    this.outputElement.innerHTML = '';
    
    // Re-add greeting with proper spacing if it exists
    this.showGreeting(terminalCore.getGreeting());
    
    // Ensure the cursor is visible after clearing
    if (this.cursorManager) {
      this.cursorManager.show();
    }
    
    // Focus the input element to ensure keyboard events work
    if (this.inputElement) {
      this.inputElement.focus();
    }
  }

  /**
   * Scroll terminal to bottom
   */
  scrollToBottom() {
    if (this.terminalElement) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        this.terminalElement.scrollTo({
          top: this.terminalElement.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  }

  /**
   * Display error message
   * @param {string} message - Error message
   */
  displayError(message) {
    const line = document.createElement('div');
    line.className = 'terminal-error';
    line.textContent = message;
    this.outputElement.appendChild(line);
    this.scrollToBottom();
  }
  
  /**
   * Display success message
   * @param {string} message - Success message
   */
  displaySuccess(message) {
    const line = document.createElement('div');
    line.className = 'terminal-success';
    line.textContent = message;
    this.outputElement.appendChild(line);
    this.scrollToBottom();
  }
  
  /**
   * Display warning message
   * @param {string} message - Warning message
   */
  displayWarning(message) {
    const line = document.createElement('div');
    line.className = 'terminal-warning';
    line.textContent = message;
    this.outputElement.appendChild(line);
    this.scrollToBottom();
  }
}

// Create singleton instance
const terminalView = new TerminalView();

export default terminalView;
