/**
 * Help Command
 * 
 * Displays organized list of available commands with descriptions
 */

import i18n from '../i18n/i18n.js';
import CommandRegistry from './registry.js';
import { eventBus } from '../utils/events.js';
import { COMMAND_EVENTS } from '../core/terminal-events.js';

/**
 * Handle the help command
 * @param {string[]} args - Command arguments
 * @returns {string} Help text with available commands (plain text, multi-line)
 */
function handleHelpCommand(args = []) {
  // If a specific command is requested
  if (args.length > 0 && args[0]) {
    const commandName = args[0].toLowerCase().trim();
    const helpText = CommandRegistry.getHelpText(commandName);
    
    if (helpText) {
      let specificHelp = `${commandName.toUpperCase()} - ${helpText.description}\n\n`;
      
      if (helpText.usage) {
        specificHelp += `Usage: ${helpText.usage}\n\n`;
      }
      
      if (helpText.examples && helpText.examples.length) {
        specificHelp += `Examples:\n`;
        helpText.examples.forEach(example => {
          specificHelp += `  › ${example}\n`;
        });
      }
      
      return specificHelp;
    } else {
      return `No help available for '${commandName}'`;
    }
  }
  
  // Show all commands organized by category
  let output = i18n.t('availableCommands') + '\n\n';
  
  // Get categories
  const categories = CommandRegistry.getAllCategories();
  
  // Display commands by category
  categories.forEach(category => {
    const commandsInCategory = CommandRegistry.getCommandsByCategory(category);
    
    if (commandsInCategory.length === 0) {
      return; // Skip empty categories
    }
    
    // Format category name for display
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    output += `${categoryName}:\n`;
    
    // Display commands in this category
    commandsInCategory.forEach(cmd => {
      const helpText = CommandRegistry.getHelpText(cmd);
      const description = helpText ? ` - ${helpText.description}` : '';
      output += `  › ${cmd}${description}\n`;
    });
    
    output += '\n'; // Add spacer between categories
  });
  
  output += 'For more details on a specific command, type "help command-name"';
  
  return output.trim();
}

// Register command and its help text
CommandRegistry.register('help', handleHelpCommand);
CommandRegistry.registerHelpText('help', {
  description: 'Displays a list of all available commands',
  usage: 'help [command-name]',
  examples: [
    'help', 
    'help clear'
  ]
});

// Use event system to categorize the command
eventBus.emit(COMMAND_EVENTS.REGISTER, {
  name: 'help',
  handler: handleHelpCommand,
  category: 'core',
  hidden: false
});

export { handleHelpCommand };
