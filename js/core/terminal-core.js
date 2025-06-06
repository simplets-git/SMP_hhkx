/**
 * Terminal Core
 * 
 * Core functionality for the terminal, handling state management
 * and providing interfaces for other components.
 */

import CONFIG from '../config.js';
import { eventBus } from '../utils/events.js';
import { TERMINAL_EVENTS } from './terminal-events.js';
import { standardizeCommandOutput } from '../utils/text-formatter.js';

class TerminalCore {
  constructor() {
    // Core configuration
    this.config = {
      name: 'simplets_terminal',
      historySize: 100,
      greetings: 'Welcome to the abyss. Type [help] to interact.',
      prompt: `${CONFIG.username}: `
    };
    
    // Terminal state
    this.commandHistory = [];
    this.historyIndex = -1;
    this.initialized = false;
    
    // Set up event listeners for core functionality
    this.setupEventListeners();
  }

  /**
   * Initialize the terminal core
   */
  initialize() {
    if (this.initialized) {
      console.log('Terminal core already initialized');
      return this;
    }

    console.log('Initializing terminal core...');
    this.initialized = true;
    
    // Emit initialization event
    eventBus.emit(TERMINAL_EVENTS.CORE_INITIALIZED, this);
    
    return this;
  }

  /**
   * Set up event listeners for core functionality
   */
  setupEventListeners() {
    console.log('[TerminalCore] Setting up event listeners');
    
    try {
      // Check if eventBus is available
      if (!eventBus) {
        console.error('[TerminalCore] ERROR: eventBus is undefined or null');
        return;
      }
      
      // Listen for command execution requests
      console.log('[TerminalCore] Registering listener for EXECUTE event:', TERMINAL_EVENTS.EXECUTE);
      eventBus.on(TERMINAL_EVENTS.EXECUTE, (command) => {
        console.log('[TerminalCore] EXECUTE event received with command:', command);
        this.executeCommand(command);
      });
      
      // Listen for command history navigation
      console.log('[TerminalCore] Registering listener for NAVIGATE event:', TERMINAL_EVENTS.NAVIGATE);
      eventBus.on(TERMINAL_EVENTS.NAVIGATE, (direction) => {
        console.log('[TerminalCore] NAVIGATE event received with direction:', direction);
        const historyEntry = this.navigateHistory(direction);
        console.log('[TerminalCore] Emitting ENTRY event with history entry:', historyEntry);
        eventBus.emit(TERMINAL_EVENTS.ENTRY, historyEntry);
      });
      
      console.log('[TerminalCore] Event listeners set up successfully');
    } catch (error) {
      console.error('[TerminalCore] ERROR: Failed to set up event listeners:', error);
    }
  }

  /**
   * Execute a command
   * @param {string} command - Command to execute
   */
  executeCommand(command) {
    if (!command) {
      console.warn('[TerminalCore] Empty command received, ignoring');
      return;
    }
    
    console.log('[TerminalCore] Executing command:', command);
    
    try {
      // Add to history
      console.log('[TerminalCore] Adding command to history');
      this.addToHistory(command);
      
      // Check if eventBus is available
      if (!eventBus) {
        console.error('[TerminalCore] ERROR: eventBus is undefined or null');
        return;
      }
      
      // Debug event listeners
      console.log('[TerminalCore] DEBUG: Current listeners for PROCESS event:', 
        eventBus._getListeners ? eventBus._getListeners(TERMINAL_EVENTS.PROCESS) : 'eventBus._getListeners not available');
      
      // Emit command processing event
      console.log('[TerminalCore] Emitting PROCESS event for command:', command, 'Event name:', TERMINAL_EVENTS.PROCESS);
      eventBus.emit(TERMINAL_EVENTS.PROCESS, command);
      console.log('[TerminalCore] PROCESS event emitted successfully');
    } catch (error) {
      console.error('[TerminalCore] ERROR: Failed to execute command:', error);
    }
  }

  /**
   * Add a command to history
   * @param {string} command - Command to add
   */
  addToHistory(command) {
    if (!command) {
      console.warn('[TerminalCore] Empty command received for history, ignoring');
      return;
    }
    
    console.log('[TerminalCore] Adding command to history:', command);
    
    try {
      // Only add if it's not the same as the most recent command
      if (this.commandHistory.length === 0 || 
          this.commandHistory[0] !== command) {
        console.log('[TerminalCore] Command is unique, adding to history');
        this.commandHistory.unshift(command);
        
        // Trim history if it exceeds the maximum size
        if (this.commandHistory.length > this.config.historySize) {
          console.log('[TerminalCore] History exceeds max size, trimming');
          this.commandHistory.pop();
        }
      } else {
        console.log('[TerminalCore] Command is duplicate of most recent, not adding to history');
      }
      
      // Reset history navigation index
      console.log('[TerminalCore] Resetting history navigation index');
      this.historyIndex = -1;
    } catch (error) {
      console.error('[TerminalCore] ERROR: Failed to add command to history:', error);
    }
  }

  /**
   * Navigate command history
   * @param {string} direction - 'up' or 'down'
   * @returns {Object} History entry information
   */
  navigateHistory(direction) {
    if (this.commandHistory.length === 0) {
      return { command: '', index: -1 };
    }
    
    // Store current index before navigation
    const previousIndex = this.historyIndex;
    
    // Navigate up (older commands)
    if (direction === 'up') {
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
      }
    } 
    // Navigate down (newer commands)
    else if (direction === 'down') {
      if (this.historyIndex > -1) {
        this.historyIndex--;
      }
    }
    
    // Get the command at the current index
    let command = '';
    if (this.historyIndex === -1) {
      command = '';
    } else {
      command = this.commandHistory[this.historyIndex];
    }
    
    return { 
      command, 
      index: this.historyIndex,
      previousIndex
    };
  }

  /**
   * Get the current command history
   * @returns {string[]} Command history array
   */
  getCommandHistory() {
    return [...this.commandHistory];
  }

  /**
   * Set the terminal prompt
   * @param {string} prompt - New prompt text
   */
  setPrompt(prompt) {
    this.config.prompt = prompt;
    eventBus.emit(TERMINAL_EVENTS.PROMPT_CHANGED, prompt);
  }

  /**
   * Get the current terminal prompt
   * @returns {string} Current prompt
   */
  getPrompt() {
    return this.config.prompt;
  }

  /**
   * Get terminal greeting message
   * @returns {string} Greeting message
   */
  getGreeting() {
    return this.config.greetings;
  }
}

// Create singleton instance
const terminalCore = new TerminalCore();

export default terminalCore;
