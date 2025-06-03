/**
 * Legal Command
 * 
 * Displays legal information about SIMPLETS
 */

import i18n from '../i18n/i18n.js';
import CommandRegistry from './registry.js';
import { eventBus } from '../utils/events.js';
import { COMMAND_EVENTS } from '../core/terminal-events.js';

/**
 * Handle the legal command
 * @returns {string} Legal information (plain text)
 */
function handleLegalCommand() {
  const legalContent = i18n.t('commands.legal');
  // Return plain text. If legalContent itself contains HTML that needs stripping (e.g. <br>),
  // CommandProcessor will handle it.
  return legalContent; 
}

// Register command and its help text
CommandRegistry.registerHelpText('legal', {
  description: 'Displays legal information about SIMPLETS',
  usage: 'legal',
  examples: ['legal']
});

// Use event system to categorize the command
eventBus.emit(COMMAND_EVENTS.REGISTER, {
  name: 'legal',
  handler: handleLegalCommand,
  category: 'info',
  hidden: false
});

export { handleLegalCommand };
