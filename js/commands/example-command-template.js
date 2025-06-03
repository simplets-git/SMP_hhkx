/**
 * Example Command Template
 * 
 * This is a template for creating new commands with translatable content.
 * DO NOT register this command - it's just for reference.
 */

import i18n from '../i18n/i18n.js';
import CommandRegistry from './registry.js';

/**
 * Handle the example command
 * @param {string} commandString - Full command string
 * @returns {string} Command result
 */
function handleExampleCommand(commandString) {
  // Parse arguments if needed
  const args = commandString.split(' ').slice(1);
  
  // If no arguments or help requested, show help
  if (args.length === 0 || args[0] === '--help') {
    return i18n.t('commands.example.help');
  }
  
  // Handle different subcommands
  switch (args[0]) {
    case 'info':
      return i18n.t('commands.example.info');
      
    case 'detail':
      return i18n.t('commands.example.detail');
      
    default:
      // You can also use parameters in translations
      return i18n.t('commands.example.unknown', { command: args[0] });
  }
}

/*
 * DO NOT UNCOMMENT - This is just for reference
 * 
 * // Register command
 * CommandRegistry.register('example', handleExampleCommand);
 * 
 * export { handleExampleCommand };
 */

/**
 * IMPORTANT: For each new command, you need to add translations to:
 * 
 * 1. /js/i18n/languages/en.js (English - required)
 * 2. Other language files as needed
 * 
 * Example translation structure:
 * 
 * commands: {
 *   example: {
 *     help: `
 *       <strong>Example Command</strong>
 *       
 *       Usage: example [subcommand]
 *       
 *       Subcommands:
 *         info    - Show basic information
 *         detail  - Show detailed information
 *     `,
 *     info: "This is basic information about the example command.",
 *     detail: "This is detailed information about the example command with extensive explanation...",
 *     unknown: "Unknown subcommand: {command}. Try 'example --help' for usage information."
 *   }
 * }
 */
