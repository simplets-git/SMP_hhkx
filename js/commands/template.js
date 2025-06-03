/**
 * Template Command
 * 
 * Provides a template for creating command content with proper spacing
 */

import CommandRegistry from './registry.js';

/**
 * Handle the template command
 * @returns {string} Template information
 */
function handleTemplateCommand() {
  // Return a template example with proper spacing that can be copied and pasted
  return [
    "COMMAND CONTENT TEMPLATE",
    "",
    "This is a standard single line of text that will display properly.",
    "",
    "This is a longer line of text that might wrap to the next line if it's too long for the terminal width but will still display properly without overlapping.",
    "",
    "You can add empty lines between paragraphs for better readability.",
    "",
    "LIST EXAMPLE:",
    "• First item in a list",
    "• Second item in a list",
    "• Third item with longer text that might wrap to the next line but will display properly",
    "",
    "SECTION HEADERS should be in all caps for emphasis.",
    "",
    "When you want to create your own command content:",
    "1. Copy this template",
    "2. Replace with your own text",
    "3. Add empty lines where you want spacing",
    "4. Paste into your command's return value",
    "",
    "End with a clear closing statement or call to action."
  ];
}

// Register the command
CommandRegistry.register('template', handleTemplateCommand);
export { handleTemplateCommand }; 