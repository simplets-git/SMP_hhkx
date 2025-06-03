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
  cleanupPreviousProjectElements();
  
  // Generate random character pairs using the SVG utility
  const charPair1 = SVGUtils.getRandomCharPair();
  const charPair2 = SVGUtils.getRandomCharPair();
  
  console.log('[PROJECT] Generated character pairs:', charPair1, charPair2);

  // Generate a unique ID for this command instance
  const instanceId = `project-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  console.log('[PROJECT] Created instance ID:', instanceId);

  // Create content with a more predictable structure for proper positioning
  return [
    // Part 1: Introduction - Using i18n for text content
    i18n.t('commands.project.title'),
    "",
    i18n.t('commands.project.description1'),
    "",
    i18n.t('commands.project.description2'),
    "",
    i18n.t('commands.project.description3'),
    "",
    i18n.t('commands.project.nftExamples'),
    
    // SVGs - simplified container with CSS classes for theme-aware styling
    {
      type: 'html',
      html: `
        <div id="${instanceId}" class="project-svg-container">
          <div class="project-svg-wrapper">
            ${SVGUtils.generateCircleSVG(charPair1)}
          </div>
          <div class="project-svg-wrapper">
            ${SVGUtils.generateCircleSVG(charPair2)}
          </div>
        </div>
        <div class="project-clear-spacer"></div>
      `,
      className: 'project-svg-block'
    },
    
    // Clear spacer to prevent overlap with next content - adding more height and unique ID
    {
      type: 'html_block',
      message: `
        <div id="${instanceId}-spacer" class="project-clear-spacer"></div>
      `,
      className: 'project-clear-spacer'
    },
    
    // Part 2: Additional info - add a bit more spacing after SVGs
    "",
    i18n.t('commands.project.uniqueImages'),
    "",
    i18n.t('commands.project.ecosystem'),
    "",
    i18n.t('commands.project.community'),
    "",
    // Add final spacer to ensure separation from next command
    {
      type: 'html_block',
      message: `
        <div id="${instanceId}-end-spacer" class="project-final-spacer"></div>
      `,
      className: 'project-final-spacer'
    },
    "",
    i18n.t('commands.project.stayTuned')
  ];
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
