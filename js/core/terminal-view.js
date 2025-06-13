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
    this.isAttemptingSelection = false; // Flag to track if user is selecting text with mouse

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
  async initialize() {
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
      
      // Show static password prompt
      this.showGreeting(terminalCore.getGreeting());
      // fancyUpdateGreeting was causing a long delay here, removed for initial prompt.
      // The fancy animation is still used for the welcome message after successful login.
      // Create input line for user
      this.createInputLine();
      // Focus the input
      this.inputElement.focus();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Mark as initialized
      this.initialized = true;
      

      
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
    // Remove any existing input line
    const oldInputLine = this.terminalElement.querySelector('.terminal-input-line');
    if (oldInputLine) {
      oldInputLine.remove();
    }

    // Create input line container
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

    // Add listener for Ctrl+Enter or Cmd+Enter to regenerate SVG
    this.inputElement.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        console.log('SVG regeneration triggered by shortcut.');
        eventBus.emit('terminal:regenerate-svg');
      }
    });

    // Clear the input field's value
    this.inputElement.value = '';

    // Initialize the CursorManager
    this.cursorManager = new CursorManager();
    this.cursorManager.initialize(inputLine, this.inputElement);
    
    this.outputElement.appendChild(inputLine);
    
    eventBus.emit('terminal:input:element:ready', this.inputElement);
    
    if (this.inputElement) {
      this.inputElement.focus();
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
      if (this.inputElement && entry) {
        if (window.simplets && window.simplets.Terminal && window.simplets.Terminal.inputHandler && typeof window.simplets.Terminal.inputHandler.setValue === 'function') {
          window.simplets.Terminal.inputHandler.setValue(entry.command);
        } else {
          console.warn('[TerminalView] InputHandler.setValue not available. Setting input value directly.');
          this.inputElement.value = entry.command;
        }
      }
    });

    // --- ROBUST CLICK vs. DRAG-SELECT HANDLING ---
    // This logic reliably distinguishes between a user clicking to focus the input
    // and dragging to select text, preventing the input from stealing focus during selection.
    let mouseDownPos = null;
    const CLICK_THRESHOLD = 5; // Max pixels moved to be considered a click.

    if (this.terminalElement) {
      // 1. On mousedown, record the starting position.
      this.terminalElement.addEventListener('mousedown', (event) => {
        // We only care about the primary mouse button (usually left).
        if (event.button === 0) {
          mouseDownPos = { x: event.clientX, y: event.clientY };
        } else {
          mouseDownPos = null; // Ignore other buttons (right-click, etc.)
        }
      });

      // 2. On click, decide whether to focus based on mouse movement.
      this.terminalElement.addEventListener('click', (event) => {
        // If the user clicked on an interactive element, do nothing.
        if (event.target.tagName === 'A' ||
            event.target.tagName === 'INPUT' ||
            event.target.tagName === 'BUTTON') {
          return;
        }

        // Check if the mouse moved significantly between mousedown and click.
        if (mouseDownPos) {
          const dx = Math.abs(event.clientX - mouseDownPos.x);
          const dy = Math.abs(event.clientY - mouseDownPos.y);

          // If it didn't move much, it's a true click. Focus the input.
          if (dx < CLICK_THRESHOLD && dy < CLICK_THRESHOLD) {
            this.inputElement.focus();
          }
        }
        // If the mouse moved more, it was a drag-select. Do nothing.
        
        // Reset for the next click cycle.
        mouseDownPos = null;
      });
    }

    // The old, complex event listeners for mousedown, mouseup, click, and selection handling
    // have been removed and replaced by the single, consolidated handler above.
    // The setupSelectionHandling() method is now also obsolete and has been removed.
  }
  
  /*
   * The setupSelectionHandling() method has been removed.
   * Its functionality is now consolidated into the single click handler
   * in setupEventListeners() for simplicity and stability.
   */

  /**
   * Animate the prompt text with overlapping random rolls.
   * @param {string} text - Prompt text to animate
   * @returns {Promise}
   */
  async animatePrompt(text) {
    if (!this.promptElement) return;
    // clear current prompt
    this.promptElement.innerHTML = '';
    // create spans for each character
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const chars = text.split('');
    const spans = chars.map(ch => {
      const span = document.createElement('span');
      span.dataset.final = ch;
      span.textContent = '';
      this.promptElement.appendChild(span);
      return span;
    });
    // animation settings
    const stagger = 80;
    const rollCount = 6;
    const interval = 50;
    // roll each span
    const promises = spans.map((span, idx) => new Promise(resolve => {
      setTimeout(() => {
        let rolls = 0;
        const timer = setInterval(() => {
          if (rolls < rollCount) {
            span.textContent = letters.charAt(Math.floor(Math.random() * letters.length));
            rolls++;
          } else {
            clearInterval(timer);
            span.textContent = span.dataset.final;
            resolve();
          }
        }, interval);
      }, idx * stagger);
    }));
    return Promise.all(promises);
  }

  /**
   * Show greeting message
   * @param {string} greeting - Greeting message
   */
  showGreeting(greeting) {
    if (!greeting) return;
    
    // Reuse or create greeting container
    let greetingContainer = this.outputElement.querySelector('.welcome-message');
    const firstTime = !greetingContainer;
    if (firstTime) {
      greetingContainer = document.createElement('div');
      greetingContainer.className = 'welcome-message';
      this.outputElement.appendChild(greetingContainer);
    } else {
      greetingContainer.innerHTML = '';
    }
    // Make sure it's visible
    greetingContainer.style.visibility = 'visible';

    this._animateTextOutput(greeting, '', greetingContainer)
      .then(() => {
        // Ensure spacer exists to reserve height
        let spacer = this.outputElement.querySelector('.welcome-spacer');
        if (!spacer) {
          spacer = document.createElement('div');
          spacer.className = 'welcome-spacer';
          this.outputElement.appendChild(spacer);
        }
        // Make sure spacer is visible
        spacer.style.visibility = 'visible';
        this.scrollToBottom();
      })
      .catch(error => console.error("Error animating greeting: ", error));
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
    
    // Let _addStaticOutputLine build the correctly styled div with the right class.
    // This ensures its structure and styling match the active input line, fixing alignment.
    this._addStaticOutputLine(fullCommandText, 'terminal-user-input');
  }

  /**
   * Display output in the terminal.
   * Handles strings, HTML objects, and arrays of mixed content.
   * @param {*} output - The content to display.
   */
  async displayOutput(output) {
    if (!output) {
      this.ensurePromptVisible();
      return;
    }

    try {
      if (Array.isArray(output)) {
        // Handle mixed-content arrays from commands like 'project'
        for (const item of output) {
          if (typeof item === 'string') {
            // For strings, wrap in a <pre> tag to preserve whitespace and formatting.
            const pre = document.createElement('pre');
            pre.style.margin = '0'; // Override default <pre> margins
            pre.style.fontFamily = 'inherit'; // Use terminal font
            pre.textContent = item;
            this._addStaticOutputLine(pre, 'command-output');
          } else if (item && item.type === 'html') {
            // For HTML blocks, create a container and set its innerHTML.
            const container = document.createElement('div');
            container.innerHTML = item.html;
            this._addStaticOutputLine(container, 'command-output');
          }
          // Add a short delay to create the line-by-line loading effect
          await new Promise(resolve => setTimeout(resolve, this.LINE_ANIMATION_BASE_DELAY_MS));
        }
      } else if (typeof output === 'object' && output.type === 'html') {
        // Handle legacy commands returning a single HTML object.
        const container = document.createElement('div');
        container.innerHTML = output.html;
        this._addStaticOutputLine(container, 'command-output');
      } else if (typeof output === 'string') {
        // Handle simple string output with animation.
        await this._animateTextOutput(output, 'command-output');
      } else {
        // Fallback for any other type of output.
        await this._animateTextOutput(JSON.stringify(output), 'command-output');
      }
    } catch (error) {
      console.error('Error displaying output:', error);
      const errorMessage = document.createElement('div');
      errorMessage.className = 'terminal-error';
      errorMessage.textContent = `Error: ${error.message}`;
      this._addStaticOutputLine(errorMessage);
    }
    
    this.ensurePromptVisible();
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
    // Remove all output lines except greeting and spacer to lock layout
    const children = Array.from(this.outputElement.children);
    children.forEach(child => {
      if (!child.classList.contains('welcome-message') && !child.classList.contains('welcome-spacer')) {
        this.outputElement.removeChild(child);
      }
    });

    // Reset cursor and input line
    if (this.cursorManager) this.cursorManager.show();
    this.createInputLine();
    if (this.inputElement) this.inputElement.focus();
  }

  /**
   * Remove existing greeting and spacer
   */
  removeGreeting() {
    if (this.outputElement) {
      const greetingEl = this.outputElement.querySelector('.welcome-message');
      if (greetingEl) {
        // Hide greeting but preserve its space to avoid layout jump
        greetingEl.style.visibility = 'hidden';
      }
      const spacer = this.outputElement.querySelector('.welcome-spacer');
      if (spacer) spacer.remove();
    }
  }

  /**
   * Update existing greeting in place with new text
   * @param {string} greeting - New greeting message
   */
  updateGreeting(greeting) {
    const greetingEl = this.outputElement.querySelector('.welcome-message');
    if (!greetingEl) return;
    // clear prior text
    greetingEl.innerHTML = '';
    // animate into existing container and then add spacer
    this._animateTextOutput(greeting, '', greetingEl)
      .then(() => {
        const spacer = document.createElement('div');
        spacer.className = 'welcome-spacer';
        greetingEl.parentNode.insertBefore(spacer, greetingEl.nextSibling);
        this.outputElement.offsetHeight; // force reflow
        this.scrollToBottom();
      })
      .catch(error => console.error('Error updating greeting:', error));
  }

  /**
   * Prepend a greeting message above all existing lines
   * @param {string} greeting - Greeting message
   * @returns {Promise} resolves after animation
   */
  prependGreeting(greeting) {
    if (!this.outputElement) return Promise.resolve();
    // Create container at top
    const greetingContainer = document.createElement('div');
    greetingContainer.className = 'welcome-message';
    this.outputElement.insertBefore(greetingContainer, this.outputElement.firstChild);
    // Animate text into it and add spacer
    return this._animateTextOutput(greeting, '', greetingContainer)
      .then(() => {
        const spacer = document.createElement('div');
        spacer.className = 'welcome-spacer';
        this.outputElement.insertBefore(spacer, greetingContainer.nextSibling);
        this.outputElement.offsetHeight;
        this.scrollToBottom();
      })
      .catch(error => console.error('Error prepending greeting:', error));
  }

  /**
   * Fancy animate a greeting with overlapping character rolls.
   * @param {string} text - Greeting text to animate
   * @returns {Promise} resolves when animation completes
   */
  fancyAnimateGreeting(text) {
    if (!this.outputElement) return Promise.resolve();
    // Reuse or create greeting container at top
    let container = this.outputElement.querySelector('.welcome-message');
    const firstTimeFA = !container;
    if (firstTimeFA) {
      container = document.createElement('div');
      container.className = 'welcome-message';
      this.outputElement.insertBefore(container, this.outputElement.firstChild);
    } else {
      container.innerHTML = '';
    }
    // Make sure it's visible
    container.style.visibility = 'visible';

    const chars = text.split('');
    const spans = chars.map(ch => {
      const span = document.createElement('span');
      span.dataset.final = ch;
      span.textContent = '';
      container.appendChild(span);
      return span;
    });

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const stagger = 40;  // ms between starts (50% faster)
    const rollCount = 6; // rolls per character
    const interval = 25; // ms per roll (50% faster)

    const promises = spans.map((span, idx) => new Promise(resolve => {
      setTimeout(() => {
        let rolls = 0;
        const timer = setInterval(() => {
          if (rolls < rollCount) {
            span.textContent = letters.charAt(Math.floor(Math.random() * letters.length));
            rolls++;
          } else {
            clearInterval(timer);
            span.textContent = span.dataset.final;
            resolve();
          }
        }, interval);
      }, idx * stagger);
    }));

    return Promise.all(promises)
      .then(() => {
        // Ensure spacer exists
        let spacer = this.outputElement.querySelector('.welcome-spacer');
        if (!spacer) {
          spacer = document.createElement('div');
          spacer.className = 'welcome-spacer';
          this.outputElement.appendChild(spacer);
        }
        // Make sure spacer is visible
        spacer.style.visibility = 'visible';
        this.scrollToBottom();
      })
      .catch(error => console.error('Error in fancyAnimateGreeting:', error));
  }

  /**
   * Fancy animate an existing greeting message with overlapping character rolls.
   * @param {string} text - Greeting text to animate
   * @returns {Promise}
   */
  async fancyUpdateGreeting(text) {
    const greetingEl = this.outputElement.querySelector('.welcome-message');
    if (!greetingEl) return;
    // clear existing text
    greetingEl.innerHTML = '';
    // create spans for each character
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const fullText = 'Welcome to the abyss. Type [help] to interact.';
    const helpStartIndex = fullText.indexOf('[help]') + 1; // +1 to start after '['
    const helpEndIndex = helpStartIndex + 'help'.length; // End after 'p'

    const chars = fullText.split('');
    const spans = chars.map((ch, index) => {
      const span = document.createElement('span');
      span.dataset.final = ch;
      span.textContent = '';
      if (index >= helpStartIndex && index < helpEndIndex) {
        span.classList.add('bold-text');
      }
      greetingEl.appendChild(span);
      return span;
    });
    const stagger = 26;  // ms between starts (35% faster)
    const rollCount = 6;
    const interval = 16; // ms per roll (35% faster)
    const promises = spans.map((span, idx) => new Promise(resolve => {
      setTimeout(() => {
        let rolls = 0;
        const timer = setInterval(() => {
          if (rolls < rollCount) {
            span.textContent = letters.charAt(Math.floor(Math.random() * letters.length));
            rolls++;
          } else {
            clearInterval(timer);
            span.textContent = span.dataset.final;
            resolve();
          }
        }, interval);
      }, idx * stagger);
    }));
    await Promise.all(promises);
    // add spacer after animation
    const spacer = document.createElement('div');
    spacer.className = 'welcome-spacer';
    greetingEl.parentNode.insertBefore(spacer, greetingEl.nextSibling);
    this.scrollToBottom();
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
