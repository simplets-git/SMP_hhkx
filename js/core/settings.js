/**
 * Terminal Settings Manager
 * 
 * Handles loading, saving, and applying terminal settings
 */

import CONFIG from '../config.js';
import i18n from '../i18n/i18n.js';
import { eventBus } from '../utils/events.js';

class SettingsManager {
  constructor() {
    this.initialized = false;
    
    // Listen for settings change events
    eventBus.on('language:changed', (data) => this.handleLanguageChange(data));
    eventBus.on('cursor:style:change', (style) => this.handleCursorStyleChange(style));
  }
  
  /**
   * Initialize settings from localStorage
   */
  async init() {
    if (this.initialized) return;
    
    console.log('Initializing terminal settings...');
    
    // Load language
    const savedLanguage = localStorage.getItem('simplets_language');
    if (savedLanguage) {
      try {
        const success = await i18n.setLanguage(savedLanguage);
        if (success) {
          window.currentLanguage = savedLanguage;
          console.log('Applied saved language:', savedLanguage);
        }
      } catch (error) {
        console.error('Error loading saved language:', error);
      }
    }
    
    // Load cursor style
    const savedCursorStyle = localStorage.getItem('cursorStyle');
    if (savedCursorStyle) {
      CONFIG.cursorStyle = savedCursorStyle;
      console.log('Applied saved cursor style:', savedCursorStyle);
    }
    
    this.initialized = true;
    console.log('Terminal settings initialized');
    
    // Emit event that settings are initialized
    eventBus.emit('settings:initialized');
  }
  
  // Font and character size handlers removed as requested
  
  /**
   * Handle language change event
   * @param {Object} data - Language change data
   */
  handleLanguageChange(data) {
    console.log('Language changed:', data);
    // No additional handling needed as the language command already saves to localStorage
  }
  
  /**
   * Handle cursor style change event
   * @param {string} style - Cursor style
   */
  handleCursorStyleChange(style) {
    console.log('Cursor style changed:', style);
    // No additional handling needed as the cursor command already saves to localStorage
  }
}

export default new SettingsManager();
