/**
 * Minting Command
 * 
 * Displays minting information
 */

import i18n from '../i18n/i18n.js';
import CommandRegistry from './registry.js';
import { eventBus } from '../utils/events.js';
import { COMMAND_EVENTS } from '../core/terminal-events.js';

/**
 * Handle the minting command
 * @returns {string} Minting information (plain text)
 */
function handleMintingCommand() {
  return i18n.t('commands.minting');
}

// Register command and its help text
CommandRegistry.registerHelpText('minting', {
  description: 'Displays information about SIMPLETS minting',
  usage: 'minting',
  examples: ['minting']
});

// Use event system to categorize the command
eventBus.emit(COMMAND_EVENTS.REGISTER, {
  name: 'minting',
  handler: handleMintingCommand,
  category: 'info',
  hidden: false
});

export { handleMintingCommand };
