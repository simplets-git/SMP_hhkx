/**
 * Theme utility functions
 * 
 * Provides theme-related utility functions and forwards to ThemeManager
 */

import SVGUtils from './svg.js';
import ThemeManager from '../themes/manager.js';
import { eventBus } from './events.js';

const ThemeUtils = {
  /**
   * Update all theme-dependent SVGs
   */
  updateAllThemeSVGs() {
    const currentTheme = ThemeManager.getCurrentThemeData();
    const bgColor = currentTheme.styles['--command-bg-color'] || 
                   (currentTheme.name === 'light' ? 'black' : 'white');
                   
    document.querySelectorAll('img.theme-svg').forEach(img => {
      // Use indices if available, else parse pair
      let indices = null;
      if (img.dataset.indices) {
        try {
          indices = JSON.parse(img.dataset.indices);
          if (!Array.isArray(indices)) indices = null;
        } catch (e) {
          console.warn('Invalid indices data:', img.dataset.indices);
        }
      }
      
      try {
        // Generate new SVG with the correct theme
                const pair = SVGUtils.getRandomCharPair(indices);
        const svg = SVGUtils.generateCircleSVG(pair, bgColor);
        if (svg) {
          img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
        }
      } catch (e) {
        console.error('Error generating theme SVG:', e);
      }
    });
    
    // Emit event that SVGs have been updated
    eventBus.emit('theme:svgsUpdated');
  },

  /**
   * Toggle between light and dark theme
   */
  toggleTheme() {
    ThemeManager.toggleTheme();
    this.updateAllThemeSVGs();
  },

  /**
   * Initialize theme from local storage or system preference
   */
  initTheme() {
    // Initialize theme manager
    ThemeManager.init();
    
    // Add event listener for theme changes to update SVGs
    eventBus.on('theme:changed', () => this.updateAllThemeSVGs());
    
    // Initial update
    this.updateAllThemeSVGs();
  },
  
  /**
   * Get the current theme name
   * @returns {string} Current theme name ('light' or 'dark')
   */
  getCurrentTheme() {
    return ThemeManager.getCurrentTheme();
  },
  
  /**
   * Set the theme
   * @param {string} themeName - Name of the theme to set ('light' or 'dark')
   */
  setTheme(themeName) {
    ThemeManager.setTheme(themeName);
    this.updateAllThemeSVGs();
  }
};

export default ThemeUtils;
