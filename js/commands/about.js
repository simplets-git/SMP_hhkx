/**
 * About Command
 * 
 * Displays information about SIMPLETS
 */

import i18n from '../i18n/i18n.js';
import CommandRegistry from './registry.js';
import { eventBus } from '../utils/events.js';
import { COMMAND_EVENTS } from '../core/terminal-events.js';

/**
 * Handle the about command
 * @returns {string} About text from i18n
 */
function handleAboutCommand() {
  // Get content from i18n
  return i18n.t('commands.about');
}

// Register command and its help text
CommandRegistry.registerHelpText('about', {
  description: 'Displays information about SIMPLETS',
  usage: 'about',
  examples: ['about']
});

// Use event system to categorize the command
eventBus.emit(COMMAND_EVENTS.REGISTER, {
  name: 'about',
  handler: handleAboutCommand,
  category: 'info',
  hidden: false
});

export { handleAboutCommand };
