/**
 * Theme Manager
 * Handles theme switching and persistence
 */

import { eventBus } from '../utils/events.js';

const ThemeManager = {
  // Available themes
  themes: ['dark', 'light'],
  
  /**
   * Initialize theme from localStorage or use dark theme as default
   */
  init() {
    const savedTheme = localStorage.getItem('preferredTheme') || 'dark';
    this.setTheme(savedTheme);
    
    // Emit event that theme system is ready
    eventBus.emit('theme:initialized');
    
    // Setup media query listener for system theme changes
    this.setupSystemThemeListener();
  },
  
  /**
   * Setup listener for system theme preference changes
   */
  setupSystemThemeListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Initial check
    const systemTheme = mediaQuery.matches ? 'dark' : 'light';
    
    // Don't overwrite user preference, but log the system preference
    console.log(`System theme preference: ${systemTheme}`);
    
    // Listen for changes
    const handleChange = (e) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      eventBus.emit('theme:systemPreferenceChanged', newSystemTheme);
      
      // If the user hasn't set a preference, follow system
      if (!localStorage.getItem('preferredTheme')) {
        this.setTheme(newSystemTheme);
      }
    };
    
    // Add the listener using the appropriate method
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }
  },
  
  /**
   * Set the current theme
   * @param {string} themeName - Name of the theme to set
   */
  setTheme(themeName) {
    // Validate theme name
    if (!this.themes.includes(themeName)) {
      console.warn(`Theme '${themeName}' not found. Using 'dark' as fallback.`);
      themeName = 'dark';
    }
    
    // Apply theme by adding the appropriate class to the body
    this.applyThemeStyles(themeName);
    
    // Save preference
    localStorage.setItem('preferredTheme', themeName);
    
    // Emit event for theme change
    eventBus.emit('theme:changed', themeName);
    
    return themeName;
  },
  
  /**
   * Apply theme styles to the document
   * @private
   * @param {string} themeName - Name of the theme to apply
   */
  applyThemeStyles(themeName) {
    // Remove any existing theme classes from the html element
    document.documentElement.classList.remove('dark-theme', 'light-theme');
    
    // Add the new theme class to the html element
    document.documentElement.classList.add(`${themeName}-theme`);

    // Also remove from body in case they were added by other means or for compatibility
    document.body.classList.remove('dark-theme', 'light-theme');
    
    console.log(`Applied theme: ${themeName} to html element`);
  },
  
  /**
   * Toggle between light and dark theme
   */
  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    return this.setTheme(newTheme);
  },
  
  /**
   * Get the current theme name
   * @returns {string} Current theme name
   */
  getCurrentTheme() {
    return localStorage.getItem('preferredTheme') || 'dark';
  },
  
  /**
   * Get the current theme configuration
   * @returns {Object} Current theme configuration
   */
  getCurrentThemeData() {
    const themeName = this.getCurrentTheme();
    return this.themes[themeName] || this.themes.dark;
  }
};

export default ThemeManager;