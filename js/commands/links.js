/**
 * Links Command
 * 
 * Displays links to SIMPLETS resources
 */

import i18n from '../i18n/i18n.js';
import CommandRegistry from './registry.js';
import { eventBus } from '../utils/events.js';
import { COMMAND_EVENTS } from '../core/terminal-events.js';

/**
 * Handle the links command
 * @returns {string} Links information (plain text)
 */
function handleLinksCommand() {
  return i18n.t('commands.links');
}

// Register command and its help text
CommandRegistry.registerHelpText('links', {
  description: 'Displays links to SIMPLETS resources',
  usage: 'links',
  examples: ['links']
});

// Use event system to categorize the command
eventBus.emit(COMMAND_EVENTS.REGISTER, {
  name: 'links',
  handler: handleLinksCommand,
  category: 'info',
  hidden: false
});

export { handleLinksCommand };
