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
  // Get computed styles to pass theme colors to the SVG utility
  const computedStyles = getComputedStyle(document.documentElement);
  const svgBgColor = computedStyles.getPropertyValue('--svg-bg-color').trim();
  const svgTextColor = computedStyles.getPropertyValue('--svg-text-color').trim();

  const svg1 = SVGUtils.generateCircleSVG(charPair1, { bgColor: svgBgColor, textColor: svgTextColor });
  const svg2 = SVGUtils.generateCircleSVG(charPair2, { bgColor: svgBgColor, textColor: svgTextColor });
  
  console.log('[PROJECT] Generated character pairs:', charPair1, charPair2);

  // Get the content from i18n, which is now an array of strings and objects
  const projectContent = i18n.t('commands.project');

  // Process the content to replace SVG placeholders and prepare for display
  const processedContent = projectContent.map(item => {
    if (typeof item === 'string') {
      // For text strings, replace placeholders and return as is
      let text = item;
      text = text.replace('{{SVG_PLACEHOLDER_1}}', `<div class="project-svg-wrapper">${svg1}</div>`);
      text = text.replace('{{SVG_PLACEHOLDER_2}}', `<div class="project-svg-wrapper">${svg2}</div>`);
      return text;
    } else if (item.type === 'svg_block') {
      // For SVG blocks, return the HTML directly
      let svgBlockHtml = item.html;
      svgBlockHtml = svgBlockHtml.replace('{{SVG_PLACEHOLDER_1}}', svg1);
      svgBlockHtml = svgBlockHtml.replace('{{SVG_PLACEHOLDER_2}}', svg2);
      return { type: 'html', html: svgBlockHtml };
    }
    return item; // Return other types as is
  });

  return processedContent;
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

// Listen for theme changes to update existing SVGs
eventBus.on('theme:changed', () => {
  const computedStyles = getComputedStyle(document.documentElement);
  const svgBgColor = computedStyles.getPropertyValue('--svg-bg-color').trim();
  const svgTextColor = computedStyles.getPropertyValue('--svg-text-color').trim();

  document.querySelectorAll('.project-svg-wrapper').forEach(wrapper => {
    const circle = wrapper.querySelector('circle');
    const text = wrapper.querySelector('text');
    if (circle) circle.style.fill = svgBgColor;
    if (text) text.style.fill = svgTextColor;
  });
});

// Listen for SVG regeneration requests
eventBus.on('terminal:regenerate-svg', () => {
  console.log('[PROJECT] Regenerating SVGs on request.');
  const wrappers = document.querySelectorAll('.project-svg-wrapper');
  
  if (wrappers.length > 0) {
    const computedStyles = getComputedStyle(document.documentElement);
    const svgBgColor = computedStyles.getPropertyValue('--svg-bg-color').trim();
    const svgTextColor = computedStyles.getPropertyValue('--svg-text-color').trim();

    wrappers.forEach(wrapper => {
      const newCharPair = SVGUtils.getRandomCharPair();
      const newSvg = SVGUtils.generateCircleSVG(newCharPair, { bgColor: svgBgColor, textColor: svgTextColor });
      wrapper.innerHTML = newSvg;
    });
    console.log(`[PROJECT] Regenerated ${wrappers.length} SVGs.`);
  } else {
    console.log('[PROJECT] No SVGs found to regenerate.');
  }
});

export { handleProjectCommand };
