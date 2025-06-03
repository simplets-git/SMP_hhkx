/**
 * Clear Command
 * 
 * Clears the terminal screen
 */

import { eventBus } from '../utils/events.js';
import CommandRegistry from './registry.js';
import { COMMAND_EVENTS } from '../core/terminal-events.js';

/**
 * Handle the clear command
 * @returns {Object} Command result
 */
function handleClearCommand() {
  // Clear the terminal and show the welcome message only
  if (window && window.JQTerminalIntegration && window.JQTerminalIntegration.terminal) {
    window.JQTerminalIntegration.terminal.clear();
    const welcomeMessage = window.JQTerminalIntegration.getWelcomeMessage
      ? window.JQTerminalIntegration.getWelcomeMessage()
      : 'Welcome to the abyss. Type [[;var(--command-text-color);]help] to interact.';
    window.JQTerminalIntegration.terminal.echo(welcomeMessage);
    window.JQTerminalIntegration.terminal.echo('');
    window.JQTerminalIntegration.terminal.echo('');
  }
  // Return special object to suppress prompt
  return {
    suppressOutput: true,
    suppressPrompt: true
  };
}

// Register command and its help text
CommandRegistry.register('clear', handleClearCommand);
CommandRegistry.registerHelpText('clear', {
  description: 'Clears the terminal screen',
  usage: 'clear',
  examples: ['clear']
});

// Use event system to categorize the command
eventBus.emit(COMMAND_EVENTS.REGISTER, {
  name: 'clear',
  handler: handleClearCommand,
  category: 'core',
  hidden: false
});

// Also register 'cls' as an alias for clear
CommandRegistry.register('cls', handleClearCommand);
CommandRegistry.registerHelpText('cls', {
  description: 'Alias for clear - clears the terminal screen',
  usage: 'cls',
  examples: ['cls']
});

eventBus.emit(COMMAND_EVENTS.REGISTER, {
  name: 'cls',
  handler: handleClearCommand,
  category: 'core',
  hidden: false
});

export { handleClearCommand };
