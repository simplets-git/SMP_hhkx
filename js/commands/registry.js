/**
 * Command Registry
 * 
 * Centralized registry for all terminal commands with enhanced error handling
 * and organization capabilities.
 */

// Import TextFormatter early to avoid circular dependencies
import TextFormatter from '../utils/text-formatter.js';
import factsCommand from './facts.js';
import { eventBus } from '../utils/events.js';
import { COMMAND_EVENTS } from '../core/terminal-events.js';

// Create the helpTexts object that will be populated
const helpTexts = {};

class CommandRegistry {
  constructor() {
    this.commands = {};
    this.hiddenCommands = {};
    this.helpTexts = helpTexts;
    this.commandCategories = {
      'core': [],
      'info': [],
      'tools': [],
      'other': []
    };

    // Register built-in commands
    this.registerCommandWithCategory(factsCommand.name, factsCommand.handler, factsCommand.category);
    this.registerHelpText(factsCommand.name, factsCommand.help);
    
    // Setup event listener for command registration
    eventBus.on(COMMAND_EVENTS.REGISTER, (data) => {
      this.registerCommandWithCategory(data.name, data.handler, data.category, data.hidden);
    });
  }
  
  /**
   * Initialize the command registry
   */
  init() {
    eventBus.emit(COMMAND_EVENTS.REGISTRY_INITIALIZED);
  }
  
  /**
   * Register a new command
   * @param {string} name - Command name
   * @param {Function} handler - Command handler function
   * @param {boolean} hidden - Whether this is a hidden command
   */
  register(name, handler, hidden = false) {
    if (!name || typeof name !== 'string') {
      console.error('[CommandRegistry] Invalid command name:', name);
      return;
    }
    
    if (!handler || typeof handler !== 'function') {
      console.error('[CommandRegistry] Invalid handler for command:', name);
      return;
    }
    
    const normalizedName = name.toLowerCase().trim();
    
    if (hidden) {
      this.hiddenCommands[normalizedName] = handler;
    } else {
      this.commands[normalizedName] = handler;
      // Add to 'other' category by default
      if (!this.commandCategories.other.includes(normalizedName)) {
        this.commandCategories.other.push(normalizedName);
      }
    }
  }
  
  /**
   * Register a command with a specific category
   * @param {string} name - Command name
   * @param {Function} handler - Command handler function
   * @param {string} category - Command category
   * @param {boolean} hidden - Whether this is a hidden command
   */
  registerCommandWithCategory(name, handler, category = 'other', hidden = false) {
    this.register(name, handler, hidden);
    
    if (!hidden && category && this.commandCategories[category]) {
      const normalizedName = name.toLowerCase().trim();
      
      // Remove from other categories if it exists
      Object.keys(this.commandCategories).forEach(cat => {
        const index = this.commandCategories[cat].indexOf(normalizedName);
        if (index !== -1) {
          this.commandCategories[cat].splice(index, 1);
        }
      });
      
      // Add to specified category
      this.commandCategories[category].push(normalizedName);
    }
  }
  
  /**
   * Register help text for a command
   * @param {string} command - Command name
   * @param {Object} helpText - Help text object
   */
  registerHelpText(command, helpText) {
    if (!command || typeof command !== 'string') {
      console.error('[CommandRegistry] Invalid command name for help text:', command);
      return;
    }
    
    const normalizedName = command.toLowerCase().trim();
    this.helpTexts[normalizedName] = helpText;
  }
  
  /**
   * Get a command handler by name
   * @param {string} name - Command name
   * @returns {Function|null} Command handler or null if not found
   */
  getCommand(name) {
    if (!name) return null;
    
    const normalizedName = name.toLowerCase().trim();
    const command = this.commands[normalizedName];
    
    if (command && typeof command === 'function') {
      // Wrap the command handler to standardize returns
      return (...args) => {
        try {
          const result = command(...args);
          
          // If the result is a string, standardize it
          if (typeof result === 'string') {
            return TextFormatter.standardizeCommandOutput(result);
          }
          
          // If it's an array with mixed content (text and HTML blocks)
          if (Array.isArray(result)) {
            return result.map(item => {
              if (typeof item === 'string') {
                return item; // Already a string in array format
              } else if (item && typeof item === 'object' && item.type === 'html_block') {
                return item; // Keep HTML blocks as is
              } else if (item && typeof item === 'object' && item.message) {
                item.message = TextFormatter.standardizeCommandOutput(item.message).join('\n');
                return item;
              }
              return item;
            });
          }
          
          return result;
        } catch (error) {
          console.error(`[CommandRegistry] Error executing command ${normalizedName}:`, error);
          return `Error executing command: ${error.message}`;
        }
      };
    }
    
    return null;
  }
  
  /**
   * Match a hidden command
   * @param {string} input - Command input
   * @returns {Object|null} { handler, input } or null if no match
   */
  matchHiddenCommand(input) {
    if (!input) return null;
    
    const normalizedInput = input.toLowerCase().trim();
    
    for (const key in this.hiddenCommands) {
      if (normalizedInput.startsWith(key)) {
        return {
          handler: this.hiddenCommands[key],
          input: input
        };
      }
    }
    
    return null;
  }
  
  /**
   * Get all registered command names
   * @returns {string[]} Array of command names
   */
  getAllCommandNames() {
    return Object.keys(this.commands).sort();
  }
  
  /**
   * Get commands by category
   * @param {string} category - Category name
   * @returns {string[]} Array of command names in that category
   */
  getCommandsByCategory(category) {
    return this.commandCategories[category] || [];
  }
  
  /**
   * Get all categories
   * @returns {string[]} Array of category names
   */
  getAllCategories() {
    return Object.keys(this.commandCategories);
  }
  
  /**
   * Get help text for a command
   * @param {string} command - Command name
   * @returns {Object|null} Help text object or null if not found
   */
  getHelpText(command) {
    if (!command) return null;
    const normalizedName = command.toLowerCase().trim();
    return this.helpTexts[normalizedName] || null;
  }
}

// Create singleton instance
const instance = new CommandRegistry();

// Export singleton instance
export default instance;