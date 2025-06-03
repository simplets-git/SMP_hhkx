/**
 * Roadmap Command
 * 
 * Displays the project roadmap
 */

import i18n from '../i18n/i18n.js';
import CommandRegistry from './registry.js';
import { eventBus } from '../utils/events.js';
import { COMMAND_EVENTS } from '../core/terminal-events.js';

/**
 * Handle the roadmap command
 * @returns {string} Roadmap information from i18n
 */
function handleRoadmapCommand() {
  // Get content from i18n
  return i18n.t('commands.roadmap');
}

// Register command and its help text
CommandRegistry.registerHelpText('roadmap', {
  description: 'Displays the SIMPLETS project roadmap',
  usage: 'roadmap',
  examples: ['roadmap']
});

// Use event system to categorize the command
eventBus.emit(COMMAND_EVENTS.REGISTER, {
  name: 'roadmap',
  handler: handleRoadmapCommand,
  category: 'info',
  hidden: false
});

export { handleRoadmapCommand };
