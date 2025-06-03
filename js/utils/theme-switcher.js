/**
 * Theme Switcher
 * A clean implementation for switching between light and dark themes
 * with proper support for our custom terminal implementation
 */

import ThemeManager from '../themes/manager.js';
import { eventBus } from './events.js';

class ThemeSwitcher {
  constructor() {
    this.initialized = false;
    this.terminalInstance = null;
  }

  /**
   * Initialize the theme switcher
   */
  init() {
    if (this.initialized) return;
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize with the current theme
    this.applyCurrentTheme();
    
    this.initialized = true;
    console.log('[ThemeSwitcher] Initialized');
  }

  /**
   * Set up event listeners for theme switching
   */
  setupEventListeners() {
    // Listen for theme toggle button clicks
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    // Listen for terminal creation to store the instance
    eventBus.on('terminal:created', (terminal) => {
      this.terminalInstance = terminal;
      this.applyThemeToTerminal(ThemeManager.getCurrentTheme());
    });
    
    // Listen for theme changes from other sources
    eventBus.on('theme:changed', (themeName) => {
      this.applyThemeToTerminal(themeName);
    });
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const currentTheme = ThemeManager.getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Set the new theme - this will update CSS variables through body class
    ThemeManager.setTheme(newTheme);
    
    // Refresh the terminal if needed
    if (this.terminalInstance && this.terminalInstance.refresh) {
      this.terminalInstance.refresh();
    }
    
    console.log(`[ThemeSwitcher] Toggled theme to: ${newTheme}`);
  }

  /**
   * Apply the current theme from ThemeManager
   */
  applyCurrentTheme() {
    const currentTheme = ThemeManager.getCurrentTheme();
    this.applyThemeToTerminal(currentTheme);
  }

  /**
   * Apply theme specifically to our custom terminal
   * @param {string} themeName - Name of the theme to apply
   */
  applyThemeToTerminal(themeName) {
    if (!this.terminalInstance) {
      console.log('[ThemeSwitcher] Terminal instance not available yet');
      return;
    }
    
    // Force refresh of terminal to apply changes
    // The body class is already updated by ThemeManager.setTheme()
    const terminal = this.terminalInstance;
    if (terminal && terminal.refresh) {
      terminal.refresh();
    }
    
    console.log(`[ThemeSwitcher] Applied theme to terminal: ${themeName}`);
  }
}

// Create and export singleton instance
const themeSwitcher = new ThemeSwitcher();
export default themeSwitcher;
