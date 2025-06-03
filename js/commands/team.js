/**
 * Team Command
 * 
 * Displays information about the SIMPLETS team
 */

import i18n from '../i18n/i18n.js';
import CommandRegistry from './registry.js';
import { eventBus } from '../utils/events.js';
import { COMMAND_EVENTS } from '../core/terminal-events.js';

/**
 * Handle the team command
 * @returns {string} Team information from i18n
 */
function handleTeamCommand() {
  // Get content from i18n
  return i18n.t('commands.team');
}

// Register command and its help text
CommandRegistry.registerHelpText('team', {
  description: 'Displays information about the SIMPLETS team',
  usage: 'team',
  examples: ['team']
});

// Use event system to categorize the command
eventBus.emit(COMMAND_EVENTS.REGISTER, {
  name: 'team',
  handler: handleTeamCommand,
  category: 'info',
  hidden: false
});

export { handleTeamCommand };
