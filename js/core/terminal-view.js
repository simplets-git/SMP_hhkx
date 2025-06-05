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

    // Animation delays
    this.CHARACTER_ANIMATION_DELAY_MS = 0;    // Set to 0 for instant line reveal
    this.LINE_ANIMATION_BASE_DELAY_MS = 60; // Base pause between lines (e.g., 60ms)
    this.LINE_ANIMATION_VARIATION_MS = 30;  // Variation for line delay (e.g., +/- 30ms, so 30-90ms)
    this.MINIMUM_LINE_DELAY_MS = 20;        // Minimum delay to ensure it's not too fast
  }

  // --- Helper methods for output ---

  _addStaticOutputLine(content, className = '') {
    const lineContainer = document.createElement('div');
    if (className) {
      lineContainer.className = className;
    }

    if (typeof content === 'string') {
      const linesArray = content.split('\n');
      linesArray.forEach((textLine, index) => {
        if (index > 0) {
          lineContainer.appendChild(document.createElement('br'));
        }
        lineContainer.appendChild(document.createTextNode(textLine));
      });
    } else if (content instanceof HTMLElement) {
      lineContainer.appendChild(content);
    } else {
      lineContainer.appendChild(document.createTextNode(String(content)));
    }

    this.outputElement.appendChild(lineContainer);
    this.scrollToBottom();
    return lineContainer;
  }

  async _animateTextOutput(text, baseClassName = '', targetContainer = null) {
    const effectiveCharDelay = this.CHARACTER_ANIMATION_DELAY_MS;
    const outputTarget = this.outputElement; // Always append new lines to the main output element

    if (!outputTarget) {
      console.error("TerminalView: this.outputElement is not available in _animateTextOutput.");
      return;
    }

    const lines = String(text).split('\n');
    let currentLineElement = targetContainer; // Use targetContainer for the first line if provided

    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];

      if (!currentLineElement || i > 0) { // Create new div for subsequent lines or if no initial target
        currentLineElement = document.createElement('div');
        if (baseClassName) {
          currentLineElement.className = baseClassName;
        }
        outputTarget.appendChild(currentLineElement);
      }
      
      if (lineText.length === 0) {
        currentLineElement.innerHTML = '&nbsp;'; // Ensure empty lines take up space
        this.scrollToBottom();
      } else {
        if (currentLineElement.innerHTML === '&nbsp;') { // Clear placeholder if we start typing
            currentLineElement.innerHTML = '';
        }
        if (effectiveCharDelay > 0) {
          for (let j = 0; j < lineText.length; j++) {
            await new Promise(resolve => setTimeout(resolve, effectiveCharDelay));
            currentLineElement.textContent += lineText[j];
            this.scrollToBottom(); // Scroll as text is added
          }
        } else {
          // If char delay is 0, set the whole line content at once
          currentLineElement.textContent = lineText;
          this.scrollToBottom(); // Scroll after line is added
        }
      }

      if (i < lines.length - 1) {
      const randomVariation = (Math.random() * 2 * this.LINE_ANIMATION_VARIATION_MS) - this.LINE_ANIMATION_VARIATION_MS;
      let currentLineDelay = this.LINE_ANIMATION_BASE_DELAY_MS + randomVariation;
      currentLineDelay = Math.max(this.MINIMUM_LINE_DELAY_MS, currentLineDelay); // Ensure minimum delay
      await new Promise(resolve => setTimeout(resolve, currentLineDelay));
      }
    }
  }
  // --- End Helper methods ---

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
      oldInputLine.remove();
    }
    // Create input line
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
    eventBus.emit('terminal:input:element:ready', this.inputElement);
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
      if (this.inputElement && entry) {
        if (window.simplets && window.simplets.Terminal && window.simplets.Terminal.inputHandler && typeof window.simplets.Terminal.inputHandler.setValue === 'function') {
          // Use InputHandler's setValue to update the input and trigger necessary events (like CHANGED for cursor update)
          window.simplets.Terminal.inputHandler.setValue(entry.command);
        } else {
          // Fallback if inputHandler is not available (should not happen in normal operation)
          console.warn('[TerminalView] InputHandler.setValue not available. Setting input value directly and attempting manual cursor update.');
          this.inputElement.value = entry.command;
        }
      }
    });
    
    // Listen for input changes
    eventBus.on(TERMINAL_EVENTS.CHANGED, (currentValue) => {
      if (this.cursorManager) {
        // The current CursorManager (js/core/cursor.js) listens to the native 'input' event
        // on the input element to update itself. Calling a specific update method here
        // based on TERMINAL_EVENTS.CHANGED is redundant and the previous method
        // 'updateCursorPosition' does not exist on the current CursorManager, causing an error.
        console.log('[TerminalView] TERMINAL_EVENTS.CHANGED received, cursor will update via its own input listener.');
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
    
    // Create container, but animation will fill it.
    const greetingContainer = document.createElement('div');
    greetingContainer.className = 'welcome-message';
    this.outputElement.appendChild(greetingContainer);

    this._animateTextOutput(greeting, '', greetingContainer) // Animate into the pre-added container
      .then(() => {
        // Add a spacer after the welcome message animation is done
        const spacer = document.createElement('div');
        spacer.className = 'welcome-spacer';
        this.outputElement.appendChild(spacer);
        
        this.outputElement.offsetHeight; // Force a reflow
        this.scrollToBottom();
      })
      .catch(error => {
        console.error("Error animating greeting: ", error);
        // Fallback to instant display if animation fails
        greetingContainer.textContent = greeting; // Set text directly
        const spacer = document.createElement('div');
        spacer.className = 'welcome-spacer';
        this.outputElement.appendChild(spacer);
        this.outputElement.offsetHeight;
        this.scrollToBottom();
      });
  }

  /**
   * Display command in the terminal as selectable text (prompt + user input)
   * @param {string} command - Command to display
   */
  displayCommand(command) {
    const oldInputLine = this.terminalElement.querySelector('.terminal-input-line');
    if (oldInputLine) {
      oldInputLine.remove();
    }

    const fullCommandText = terminalCore.getPrompt() + command;
    const loggedCommandSpan = document.createElement('span');
    loggedCommandSpan.className = 'terminal-command terminal-user-input';
    loggedCommandSpan.textContent = fullCommandText;
    
    // Use _addStaticOutputLine for instant display of the command echo.
    // The class 'command-output historical-prompt-line' applies to the line container.
    return this._addStaticOutputLine(loggedCommandSpan, 'command-output historical-prompt-line');
  }

  /**
   * Display output in the terminal
   * @param {*} output - Output to display
   * @param {HTMLElement} container - Optional: A specific container to append to (mostly deprecated by animation logic)
   */
  async displayOutput(output, container = null) { // Method becomes async
    if (!output) return;
    
    // The 'container' argument is largely unused now as helpers manage their own line containers
    // within this.outputElement. If it were to be used, _animateTextOutput would need modification.

    try {
      if (Array.isArray(output)) {
        let stringBuffer = [];
        for (const item of output) {
          if (typeof item === 'string') {
            stringBuffer.push(item);
          } else if (item && typeof item === 'object') {
            // If there are buffered strings, animate them first
            if (stringBuffer.length > 0) {
              const combinedString = stringBuffer.join('\n');
              await this._animateTextOutput(combinedString, 'command-output');
              stringBuffer = []; // Clear the buffer
            }
            // Now handle the object
            await this.handleResultObject(item);
          }
        }
        // After the loop, if there are any remaining strings in the buffer, animate them
        if (stringBuffer.length > 0) {
          const combinedString = stringBuffer.join('\n');
          await this._animateTextOutput(combinedString, 'command-output');
        }
      } else if (typeof output === 'string') {
        await this._animateTextOutput(output, 'command-output');
      } else if (output && typeof output === 'object') {
        await this.handleResultObject(output);
      }
      
      this.ensurePromptVisible(); // Ensure prompt is visible after all output is processed
    } catch (error) {
      console.error('Error displaying output:', error);
      await this._animateTextOutput(`Error displaying output: ${error.message}`, 'terminal-error');
      this.ensurePromptVisible(); // Also ensure prompt is visible after error output
    }
  }

  /**
   * Handle a result object in the display
   * @param {Object} item - The result object to handle
   */
  async handleResultObject(item) { // Method becomes async, addOutput param removed
    if (item.error) {
      await this._animateTextOutput(item.error, 'terminal-error');
    } else if (item.type === 'html' || item.type === 'html_block' || item.html || item.className === 'raw-html-output') {
      // Handle complex HTML content statically
      const htmlContentContainer = document.createElement('div');
      htmlContentContainer.className = item.className || ''; // Use provided class or default
      htmlContentContainer.innerHTML = item.html || item.message || item.content || ''; // Prefer .html or .content
      
      // Execute any scripts in the HTML (existing logic)
      const scripts = htmlContentContainer.getElementsByTagName('script');
      Array.from(scripts).forEach(script => {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        // Appending to body and removing might not always be ideal, but it's the existing logic.
        document.body.appendChild(newScript).parentNode.removeChild(newScript);
      });
      this._addStaticOutputLine(htmlContentContainer); // Add the fully formed HTML element statically
    } else if (item.text || item.message) { // General text or message, animate this.
      await this._animateTextOutput(item.text || item.message, item.className || 'command-output');
    } else if (item.type === 'success') {
      await this._animateTextOutput(item.message || item.content || JSON.stringify(item), 'terminal-success');
    } else if (item.type === 'warning') {
      await this._animateTextOutput(item.message || item.content || JSON.stringify(item), 'terminal-warning');
    } else if (item.type === 'svg') {
      this.displaySvg(item.content || item.svg); // SVGs are complex, add statically via existing method
    } else {
      // Default for other objects: stringify and animate as plain text
      await this._animateTextOutput(JSON.stringify(item), 'command-output');
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
  async displayError(message) { // Method becomes async
    await this._animateTextOutput(message, 'terminal-error');
    // scrollToBottom is handled by _animateTextOutput
  }
  
  /**
   * Display success message
   * @param {string} message - Success message
   */
  async displaySuccess(message) { // Method becomes async
    await this._animateTextOutput(message, 'terminal-success');
    // scrollToBottom is handled by _animateTextOutput
  }
  
  /**
   * Display warning message
   * @param {string} message - Warning message
   */
  async displayWarning(message) { // Method becomes async
    await this._animateTextOutput(message, 'terminal-warning');
    // scrollToBottom is handled by _animateTextOutput
  }
}

// Create singleton instance
const terminalView = new TerminalView();

export default terminalView;
