/**
 * Manifesto Command
 * 
 * Displays the SIMPLETS manifesto
 */

import i18n from '../i18n/i18n.js';
import CommandRegistry from './registry.js';
import { eventBus } from '../utils/events.js';
import { COMMAND_EVENTS } from '../core/terminal-events.js';

/**
 * Handle the manifesto command
 * @returns {string} Command result
 */
function handleManifestoCommand() {
  // Return the SIMPLETS manifesto directly
  return i18n.t('commands.manifesto');
}

// Register command and its help text
CommandRegistry.registerHelpText('manifesto', {
  description: 'Displays the SIMPLETS manifesto',
  usage: 'manifesto',
  examples: ['manifesto']
});

// Use event system to categorize the command
eventBus.emit(COMMAND_EVENTS.REGISTER, {
  name: 'manifesto',
  handler: handleManifestoCommand,
  category: 'info',
  hidden: false
});

export { handleManifestoCommand };
