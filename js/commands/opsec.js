/**
 * Opsec Command
 * 
 * Displays operational security information
 */

import CommandRegistry from '../commands/registry.js';
import i18n from '../i18n/i18n.js';
import { eventBus } from '../utils/events.js';
import { COMMAND_EVENTS } from '../core/terminal-events.js';

/**
 * Handle the opsec command
 * @returns {string} Opsec information (plain text)
 */
function handleOpsecCommand() {
  // Get the opsec content from i18n
  let opsecContent = i18n.t('commands.opsec');
  
  // Return the plain text content
  return opsecContent;
}

// Register command and its help text
CommandRegistry.registerHelpText('opsec', {
  description: 'Displays operational security information',
  usage: 'opsec',
  examples: ['opsec']
});

// Use event system to categorize the command
eventBus.emit(COMMAND_EVENTS.REGISTER, {
  name: 'opsec',
  handler: handleOpsecCommand,
  category: 'info',
  hidden: false
});

export { handleOpsecCommand };
