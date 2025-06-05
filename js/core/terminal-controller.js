/**
 * Terminal Controller
 * 
 * Handles user input and command execution for the terminal.
 */

import { eventBus } from '../utils/events.js';
import { TERMINAL_EVENTS } from './terminal-events.js';
import CommandRegistry from '../commands/registry.js';
import terminalCore from './terminal-core.js';
import terminalView from './terminal-view.js';

class TerminalController {
  constructor() {
    // Command registry
    this.commandRegistry = CommandRegistry;
    
    // State
    this.initialized = false;
    this.isProcessingCommand = false;
  }

  /**
   * Initialize the terminal controller
   * @returns {Object} Terminal controller instance
   */
  initialize() {
    if (this.initialized) {
      console.log('Terminal controller already initialized');
      return this;
    }

    console.log('Initializing terminal controller...');
    
    // Set up event listeners
    this.setupEventListeners();
    
    this.initialized = true;
    
    // Emit initialization event
    eventBus.emit(TERMINAL_EVENTS.CONTROLLER_INITIALIZED, this);
    
    return this;
  }

  /**
   * Set up event listeners for the controller
   */
  setupEventListeners() {
    console.log('[TerminalController] Setting up event listeners');
    
    try {
      // Check if eventBus is available
      if (!eventBus) {
        console.error('[TerminalController] ERROR: eventBus is undefined or null');
        return;
      }
      
      // Listen for command submission from the input handler
      console.log('[TerminalController] Registering listener for SUBMIT event:', TERMINAL_EVENTS.SUBMIT);
      console.log('[TerminalController] Using direct event name: terminal:input:submit');
      
      // Debug existing listeners
      console.log('[TerminalController] DEBUG: Current listeners before registration:', 
        eventBus._getListeners ? eventBus._getListeners('terminal:input:submit') : 'eventBus._getListeners not available');
      
      eventBus.on('terminal:input:submit', (command) => {
        console.log('[TerminalController] SUBMIT event received with command:', command);
        this.handleCommandSubmission(command);
      });
      
      // Verify listener was registered
      console.log('[TerminalController] DEBUG: Current listeners after registration:', 
        eventBus._getListeners ? eventBus._getListeners('terminal:input:submit') : 'eventBus._getListeners not available');
      
      // Listen for command processing requests
      console.log('[TerminalController] Registering listener for PROCESS event:', TERMINAL_EVENTS.PROCESS);
      eventBus.on(TERMINAL_EVENTS.PROCESS, (command) => {
        console.log('[TerminalController] PROCESS event received with command:', command);
        this.processCommand(command);
      });
      
      // Listen for direct command execution (e.g., from buttons)
      document.addEventListener('command:execute', (event) => {
        console.log('[TerminalController] command:execute event received:', event.detail);
        if (event.detail && event.detail.command) {
          this.handleCommandSubmission(event.detail.command);
        }
      });
      
      // Listen for keyboard events on the document
      document.addEventListener('keydown', (event) => {
        this.handleKeyboardShortcuts(event);
      });
      
      console.log('[TerminalController] Event listeners set up successfully');
    } catch (error) {
      console.error('[TerminalController] ERROR: Failed to set up event listeners:', error);
    }
  }

  /**
   * Handle command submission from the input handler
   * @param {string} command - Command to handle
   */
  handleCommandSubmission(command) {
    console.log('[TerminalController] Handling command submission:', command);
    if (!command) {
      console.warn('[TerminalController] Empty command received, ignoring');
      return;
    }
    
    try {
      // Display the command in the terminal
      console.log('[TerminalController] Displaying command in terminal view');
      if (!terminalView) {
        console.error('[TerminalController] ERROR: terminalView is undefined or null');
        return;
      }
      terminalView.displayCommand(command);
      
      // Process the command
      console.log('[TerminalController] Executing command via terminalCore');
      if (!terminalCore) {
        console.error('[TerminalController] ERROR: terminalCore is undefined or null');
        return;
      }
      terminalCore.executeCommand(command);
      console.log('[TerminalController] Command sent to terminalCore successfully');
    } catch (error) {
      console.error('[TerminalController] ERROR: Failed to process command:', error);
    }
  }

  /**
   * Process a command
   * @param {string} command - Command to process
   */
  async processCommand(command) {
    console.log('[TerminalController] Processing command:', command);
    if (!command) {
      console.warn('[TerminalController] Empty command received, ignoring');
      return;
    }
    
    if (this.isProcessingCommand) {
      console.warn('[TerminalController] Already processing a command, ignoring new command:', command);
      return;
    }
    
    try {
      console.log('[TerminalController] Setting isProcessingCommand flag to true');
      this.isProcessingCommand = true;
      
      // Parse the command
      console.log('[TerminalController] Parsing command:', command);
      const { commandName, args } = this.parseCommand(command);
      console.log('[TerminalController] Parsed command name:', commandName, 'with args:', args);
      
      // Handle built-in commands
      console.log('[TerminalController] Checking if command is built-in:', commandName);
      if (await this.handleBuiltInCommand(commandName, args)) {
        console.log('[TerminalController] Command was handled as built-in command');
        this.isProcessingCommand = false;
        return;
      }
      
      // Check if the command exists in the registry
      console.log('[TerminalController] Looking up command in registry:', commandName);
      if (!this.commandRegistry) {
        console.error('[TerminalController] ERROR: commandRegistry is undefined or null');
        this.isProcessingCommand = false;
        return;
      }
      
      const commandHandler = this.commandRegistry.getCommand(commandName);
      console.log('[TerminalController] Command handler found:', commandHandler ? 'Yes' : 'No');
      
      if (!commandHandler) {
        console.log('[TerminalController] Unknown command:', commandName);
        if (!terminalView) {
          console.error('[TerminalController] ERROR: terminalView is undefined or null');
          this.isProcessingCommand = false;
          return;
        }
        await terminalView.displayError(`Unknown command: ${commandName}`);
        this.isProcessingCommand = false;
        return;
      }
      
      // Execute the command using the handler we retrieved
      try {
        console.log('[TerminalController] Executing command handler with args:', args);
        // Spread the args array when calling the handler to match the original behavior
        const result = await commandHandler(...args);
        console.log('[TerminalController] Command handler executed successfully, result:', result);
        
        // Display the result
        if (result !== undefined) {
          console.log('[TerminalController] Displaying command result');
          if (!terminalView) {
            console.error('[TerminalController] ERROR: terminalView is undefined or null');
            this.isProcessingCommand = false;
            return;
          }
          await terminalView.displayOutput(result);
        }
      } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        await terminalView.displayError(`Error executing command ${commandName}: ${error.message}`);
      }
    } catch (error) {
      console.error('Error processing command:', error);
      await terminalView.displayError(`Error processing command: ${error.message}`);
    } finally {
      this.isProcessingCommand = false;
      // Only create a new input line if one does not exist (prevents duplicate prompts)
      if (terminalView) {
        try {
          const existingInput = terminalView.terminalElement && terminalView.terminalElement.querySelector('.terminal-input-line');
          console.log('[DEBUG] Checking for existing input line:', !!existingInput, existingInput);
          if (!existingInput) {
            console.log('[DEBUG] No input line found, creating new input line.');
            terminalView.createInputLine();
          } else {
            console.log('[DEBUG] Input line already exists, not creating a new one.');
          }
        } catch (e) {
          console.error('[DEBUG] Exception during input line check/creation:', e);
        }
      } else {
        console.error('[TerminalController] ERROR: terminalView is undefined or null, cannot create new input line.');
      }
    }
  }

  /**
   * Parse a command string into command name and arguments
   * @param {string} commandString - Command string to parse
   * @returns {Object} Parsed command with name and arguments
   */
  parseCommand(commandString) {
    if (!commandString) {
      return { commandName: '', args: [] };
    }
    
    // Split the command string by spaces, but respect quoted arguments
    const parts = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < commandString.length; i++) {
      const char = commandString[i];
      
      if ((char === '"' || char === "'") && (i === 0 || commandString[i - 1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = '';
        } else {
          current += char;
        }
      } else if (char === ' ' && !inQuotes) {
        if (current) {
          parts.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    if (current) {
      parts.push(current);
    }
    
    // The first part is the command name, the rest are arguments
    const commandName = parts[0] || '';
    const args = parts.slice(1);
    
    return { commandName, args };
  }

  /**
   * Handle built-in commands
   * @param {string} commandName - Command name
   * @param {string[]} args - Command arguments
   * @returns {boolean} True if the command was handled
   */
  async handleBuiltInCommand(commandName, args) {
    switch (commandName.toLowerCase()) {
      case 'clear':
        eventBus.emit(TERMINAL_EVENTS.CLEAR);
        return true;
        
      case 'version':
        const versionInfo = this.getVersionInfo();
        await terminalView.displayOutput(versionInfo);
        return true;
        
      // Help command is now handled by the command registry
      // case 'help':
      //   const helpText = this.getHelpText(args[0]);
      //   await terminalView.displayOutput(helpText); // If re-enabled, ensure await
      //   return true;
        
      default:
        return false;
    }
  }

  /**
   * Get version information
   * @returns {Object} Version information
   */
  getVersionInfo() {
    try {
      const versionElement = document.getElementById('version-display');
      const version = versionElement ? versionElement.textContent.replace('Version: ', '') : 'unknown';
      
      return {
        text: `SimpleTS Terminal v${version}`,
        className: 'terminal-version'
      };
    } catch (error) {
      console.error('Error getting version info:', error);
      return {
        text: 'SimpleTS Terminal',
        className: 'terminal-version'
      };
    }
  }

  /**
   * Get help text for commands
   * @param {string} command - Optional specific command to get help for
   * @returns {Object} Help text
   */
  getHelpText(command) {
    if (command) {
      // Get help for a specific command
      const helpText = this.commandRegistry.getHelpText(command);
      if (helpText) {
        return {
          text: `${command}: ${helpText.help || 'No help available'}`,
          className: 'terminal-help'
        };
      } else {
        return {
          text: `No help available for command: ${command}`,
          className: 'terminal-error'
        };
      }
    } else {
      // Get general help
      return this.generateGeneralHelp();
    }
  }

  /**
   * Generate general help text
   * @returns {Object} General help text
   */
  generateGeneralHelp() {
    try {
      const categories = this.commandRegistry.getAllCategories();
      let helpText = 'Available commands:\n';
      
      categories.forEach(category => {
        const commands = this.commandRegistry.getCommandsByCategory(category);
        if (commands.length > 0) {
          helpText += `\n${category.toUpperCase()}:\n`;
          commands.forEach(cmd => {
            const cmdHelp = this.commandRegistry.getHelpText(cmd);
            const helpSummary = cmdHelp ? cmdHelp.help.split('\n')[0] : 'No description';
            helpText += `  ${cmd.padEnd(12)} - ${helpSummary}\n`;
          });
        }
      });
      
      helpText += '\nType "help <command>" for more information about a specific command.';
      
      return {
        text: helpText,
        className: 'terminal-help'
      };
    } catch (error) {
      console.error('Error generating help text:', error);
      return {
        text: 'Error generating help text. Please try again.',
        className: 'terminal-error'
      };
    }
  }

  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyboardShortcuts(event) {
    // Ctrl+L to clear the terminal
    if (event.ctrlKey && event.key === 'l') {
      event.preventDefault();
      eventBus.emit('terminal:clear');
    }
  }
}

// Create singleton instance
const terminalController = new TerminalController();

export default terminalController;
