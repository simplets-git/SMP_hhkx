/**
 * Project Command
 * 
 * Displays project information with SVG images
 */

import SVGUtils from '../utils/svg.js';
import CommandRegistry from './registry.js';
import ThemeManager from '../themes/manager.js';
import { eventBus } from '../utils/events.js';
import i18n from '../i18n/i18n.js';
import { COMMAND_EVENTS } from '../core/terminal-events.js';

function handleProjectCommand() {
  console.log('[PROJECT] Starting project command execution');
  
  // Clean up any orphaned project elements from previous executions
  // This might need review/simplification later if it causes issues with the new HTML structure
  cleanupPreviousProjectElements(); 
  
  // Generate random character pairs using the SVG utility
  const charPair1 = SVGUtils.getRandomCharPair();
  const charPair2 = SVGUtils.getRandomCharPair();
  const svg1 = SVGUtils.generateCircleSVG(charPair1);
  const svg2 = SVGUtils.generateCircleSVG(charPair2);
  
  console.log('[PROJECT] Generated character pairs:', charPair1, charPair2);

  // Get the HTML template from i18n
  // Assumes 'commands.project' is the key for the single HTML string in en.js
  let htmlTemplate = i18n.t('commands.project');

  // Replace placeholders with actual SVGs, wrapped in a div for consistent styling if needed
  htmlTemplate = htmlTemplate.replace('{{SVG_PLACEHOLDER_1}}', `<div class="project-svg-wrapper">${svg1}</div>`);
  htmlTemplate = htmlTemplate.replace('{{SVG_PLACEHOLDER_2}}', `<div class="project-svg-wrapper">${svg2}</div>`);
  
  // Return the complete HTML content to be rendered
  // The terminal rendering logic should handle an object of type 'html' by setting innerHTML
  return [{
    type: 'html', // Or 'html_block' depending on how your terminal handles these types
    html: htmlTemplate,
    // className: 'project-output' // Optional: for overall styling of the project command output
  }];
}

/**
 * Clean up any orphaned project elements from previous executions
 * This helps prevent overlap issues when running the command multiple times
 */
function cleanupPreviousProjectElements() {
  console.log('[PROJECT] Checking for orphaned elements to clean up');
  
  // Wait for DOM to be ready
  setTimeout(() => {
    try {
      // Get terminal output element
      const terminalOutput = document.getElementById('terminal-output');
      if (!terminalOutput) {
        console.log('[PROJECT] Terminal output not found, skipping cleanup');
        return;
      }
      
      // Remove any orphaned containers
      const orphanedContainers = document.querySelectorAll('.project-svg-container[style*="position: absolute"]');
      if (orphanedContainers.length > 0) {
        console.log(`[PROJECT] Removing ${orphanedContainers.length} orphaned containers`);
        orphanedContainers.forEach(container => container.remove());
      }
      
      // Fix any remaining project elements with incorrect styles
      const projectElements = terminalOutput.querySelectorAll(
        '.project-svg-block, .project-svg-container, .project-clear-spacer, .project-final-spacer'
      );
      
      if (projectElements.length > 0) {
        console.log(`[PROJECT] Found ${projectElements.length} project elements to check`);
        
        // Apply proper CSS classes instead of inline styles
        projectElements.forEach(element => {
          // Reset any problematic inline styles
          if (element.style.position === 'absolute') {
            element.style.position = 'relative';
          }
          
          // Ensure proper display
          if (element.style.display === 'none') {
            element.style.display = 'block';
          }
        });
      }
    } catch (error) {
      console.error('[PROJECT] Error during cleanup:', error);
    }
  }, 0);
}

// Register command and its help text
CommandRegistry.registerHelpText('project', {
  description: 'Displays information about the SIMPLETS project with visual examples',
  usage: 'project',
  examples: ['project']
});

// Use event system to categorize the command
eventBus.emit(COMMAND_EVENTS.REGISTER, {
  name: 'project',
  handler: handleProjectCommand,
  category: 'info',
  hidden: false
});

export { handleProjectCommand };
