/**
 * Enhanced Internationalization module
 * 
 * Features:
 * - Lazy loading of translations
 * - Translation memory (localStorage)
 * - Translation testing
 */

import { availableLanguages, loadLanguage, getDefaultLanguage, isLanguageAvailable } from './languages/index.js';
import { eventBus } from '../utils/events.js';

// No legacy translations import needed anymore

class I18n {
  constructor() {
    // Initialize properties
    this.currentLanguage = getDefaultLanguage();
    this.translations = {};
    this.loadedLanguages = new Set();
    this.isLoading = false;
    this.pendingCallbacks = [];
    
    // Initialize with stored or browser language
    this.initLanguage();
  }

  /**
   * Initialize language based on stored preference or browser settings
   */
  async initLanguage() {
    // Try to load from localStorage first
    const storedLang = localStorage.getItem('simplets_language');
    
    if (storedLang && isLanguageAvailable(storedLang)) {
      this.currentLanguage = storedLang;
    } else {
      // Fall back to browser language if available
      const browserLang = navigator.language.split('-')[0];
      if (isLanguageAvailable(browserLang)) {
        this.currentLanguage = browserLang;
      }
    }
    
    // Set global variable for access in templates
    window.currentLanguage = this.currentLanguage;
    
    // Load the current language
    await this.loadTranslationsForLanguage(this.currentLanguage);
    
    // Also preload English as fallback
    if (this.currentLanguage !== 'en') {
      this.loadTranslationsForLanguage('en', false); // Load in background
    }
    
    // Emit event that i18n is ready
    eventBus.emit('i18n:ready', { language: this.currentLanguage });
  }
  
  /**
   * Load translations for a specific language
   * @param {string} lang - Language code to load
   * @param {boolean} setAsCurrent - Whether to set as current language
   * @returns {Promise<Object>} - The loaded translations
   */
  async loadTranslationsForLanguage(lang, setAsCurrent = true) {
    if (!isLanguageAvailable(lang)) {
      console.warn(`Language ${lang} is not available, falling back to default`);
      lang = getDefaultLanguage();
    }
    
    // If already loaded, return immediately
    if (this.loadedLanguages.has(lang)) {
      if (setAsCurrent) {
        this.currentLanguage = lang;
        window.currentLanguage = lang;
      }
      return this.translations[lang];
    }
    
    try {
      // Load the language module
      const translations = await loadLanguage(lang);
      
      // Store the translations
      this.translations[lang] = translations;
      this.loadedLanguages.add(lang);
      
      if (setAsCurrent) {
        this.currentLanguage = lang;
        window.currentLanguage = lang;
      }
      
      return translations;
    } catch (error) {
      console.warn(`Failed to load language file: ${lang}`, error);
      
      // If the language couldn't be loaded, try to fall back to English
      if (lang !== 'en') {
        console.log(`Falling back to English`);
        return this.loadTranslationsForLanguage('en', false);
      }
      
      console.error(`No translations available for ${lang}`);
      return null;
    }
  }

  /**
   * Get translation for a key
   * @param {string} key - Translation key (dot notation for nested keys)
   * @param {Object} params - Parameters to replace in the translation
   * @returns {string} - Translated text
   */
  t(key, params = {}) {
    // If translations aren't loaded yet, return the key
    if (!this.loadedLanguages.has(this.currentLanguage)) {
      // Queue this request for when translations are loaded
      this.loadTranslationsForLanguage(this.currentLanguage).then(() => {
        // Re-emit any events that were waiting for translations
        eventBus.emit('i18n:updated');
      });
      return key;
    }
    
    const lang = this.currentLanguage;
    const fallbackLang = 'en';
    
    // Get the translation object for the current language
    const langData = this.translations[lang] || this.translations[fallbackLang];
    
    // Parse dot notation (e.g., 'commands.about')
    let translation = key.split('.').reduce((obj, k) => obj && obj[k], langData);
    
    // If translation not found, try fallback language
    if (!translation && lang !== fallbackLang && this.loadedLanguages.has(fallbackLang)) {
      translation = key.split('.').reduce((obj, k) => obj && obj[k], this.translations[fallbackLang]);
    }
    
    // If still not found, return the key itself
    if (!translation) {
      // Log missing translation for debugging
      console.warn(`Missing translation: ${key} for language: ${lang}`);
      return key;
    }
    
    // Handle special case for language command which needs current language
    if (key === 'commands.language') {
      if (typeof translation === 'string') {
        translation = translation.replace('${window.currentLanguage}', window.currentLanguage || 'en');
      }
    }
    
    // Replace parameters if any
    if (params && typeof translation === 'string') {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param]);
      });
    }
    
    return translation;
  }

  /**
   * Set the current language
   * @param {string} lang - Language code
   * @returns {Promise<boolean>} - Success status
   */
  async setLanguage(lang) {
    if (!isLanguageAvailable(lang)) {
      return false;
    }
    
    try {
      // Load the language if not already loaded
      await this.loadTranslationsForLanguage(lang);
      
      // Store the preference in localStorage
      localStorage.setItem('simplets_language', lang);
      
      // Emit event for language change
      eventBus.emit('language:changed', { language: lang });
      
      return true;
    } catch (error) {
      console.error(`Failed to set language to ${lang}`, error);
      return false;
    }
  }
  
  /**
   * Get the current language
   * @returns {string} Current language code
   */
  getLanguage() {
    return this.currentLanguage;
  }
  
  /**
   * Get list of available languages
   * @returns {Array<Object>} List of language objects with code and name
   */
  getAvailableLanguages() {
    return Object.entries(availableLanguages).map(([code, meta]) => ({
      code,
      name: meta.name,
      nativeName: meta.nativeName,
      isDefault: !!meta.isDefault
    }));
  }
  
  /**
   * Test translations for completeness
   * @param {string} targetLang - Language to test
   * @param {string} baseLang - Base language to compare against (default: 'en')
   * @returns {Promise<Object>} - Test results
   */
  async testTranslations(targetLang, baseLang = 'en') {
    // Make sure both languages are loaded
    await Promise.all([
      this.loadTranslationsForLanguage(targetLang, false),
      this.loadTranslationsForLanguage(baseLang, false)
    ]);
    
    const baseTranslations = this.translations[baseLang];
    const targetTranslations = this.translations[targetLang];
    
    if (!baseTranslations || !targetTranslations) {
      throw new Error(`Could not load translations for testing`);
    }
    
    const missingKeys = [];
    const extraKeys = [];
    
    // Check for missing keys
    function checkKeys(baseObj, targetObj, path = '') {
      for (const key in baseObj) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof baseObj[key] === 'object' && baseObj[key] !== null && !Array.isArray(baseObj[key])) {
          // It's a nested object, recurse
          if (!targetObj[key] || typeof targetObj[key] !== 'object') {
            missingKeys.push(currentPath);
          } else {
            checkKeys(baseObj[key], targetObj[key], currentPath);
          }
        } else {
          // It's a leaf value
          if (targetObj[key] === undefined) {
            missingKeys.push(currentPath);
          }
        }
      }
    }
    
    // Check for extra keys
    function checkExtraKeys(targetObj, baseObj, path = '') {
      for (const key in targetObj) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof targetObj[key] === 'object' && targetObj[key] !== null && !Array.isArray(targetObj[key])) {
          // It's a nested object, recurse
          if (!baseObj[key] || typeof baseObj[key] !== 'object') {
            extraKeys.push(currentPath);
          } else {
            checkExtraKeys(targetObj[key], baseObj[key], currentPath);
          }
        } else {
          // It's a leaf value
          if (baseObj[key] === undefined) {
            extraKeys.push(currentPath);
          }
        }
      }
    }
    
    checkKeys(baseTranslations, targetTranslations);
    checkExtraKeys(targetTranslations, baseTranslations);
    
    return {
      language: targetLang,
      baseLang,
      missingKeys,
      extraKeys,
      isComplete: missingKeys.length === 0,
      completionPercentage: baseTranslations ? 
        (100 - (missingKeys.length / Object.keys(baseTranslations).length) * 100).toFixed(2) : 0
    };
  }
}

// Create a global translation function for convenience
window.getTranslation = (key, params) => i18n.t(key, params);

const i18n = new I18n();
export default i18n;
