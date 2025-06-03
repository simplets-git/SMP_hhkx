/**
 * Language Command
 * 
 * Displays language information and handles language changes
 */

import i18n from '../i18n/i18n.js';
import DOMUtils from '../utils/dom.js';
import CommandRegistry from './registry.js';
import { showCommandMenu } from '../utils/menu-utils.js';
import { eventBus } from '../utils/events.js';
import { TERMINAL_EVENTS, COMMAND_EVENTS } from '../core/terminal-events.js';

/**
 * Handle the language command
 * @param {Array} args - Command arguments
 * @returns {string|Object} Language information or menu
 */
function handleLanguageCommand(args) {
  // Log the arguments to help with debugging
  console.log('language command called with args:', args);
  
  // If arguments are provided, try to set the language
  if (args && args.length > 0) {
    const langCode = args[0].toLowerCase();
    return setLanguage(langCode);
  }
  
  // Otherwise, show the language menu
  return showLanguageMenu();
}

/**
 * Show a menu with available language options
 * @returns {Object} Menu result
 */
function showLanguageMenu() {
  const availableLanguages = i18n.getAvailableLanguages();
  const currentLang = i18n.getLanguage();
  
  const menuOptions = availableLanguages.map(lang => ({
    label: `${lang.flag} ${lang.name} - ${lang.nativeName}`,
    value: lang.code,
    data: lang,
    html: true // Allow HTML for flag emoji
  }));

  console.log('Language menu options:', menuOptions);

  return showCommandMenu(
    menuOptions,
    'Select a language for the terminal',
    (selected) => {
      console.log('Selected language:', selected);
      
      // Get the selected language data
      let langCode, langName, langNativeName;
      
      // Handle different formats of the selected value
      if (typeof selected === 'object' && selected !== null) {
        // If it's the full option object with data
        if (selected.data) {
          langCode = selected.value;
          langName = selected.data.name;
          langNativeName = selected.data.nativeName;
        } 
        // If it's just the value
        else if (selected.value) {
          const lang = availableLanguages.find(l => l.code === selected.value);
          if (lang) {
            langCode = lang.code;
            langName = lang.name;
            langNativeName = lang.nativeName;
          }
        }
      } 
      // If it's a direct string value (language code)
      else if (typeof selected === 'string') {
        const lang = availableLanguages.find(l => l.code === selected);
        if (lang) {
          langCode = lang.code;
          langName = lang.name;
          langNativeName = lang.nativeName;
        }
      }
      
      // Fallback if we couldn't determine the language
      if (!langCode) {
        const lang = availableLanguages.find(l => 
          l.code === selected || 
          (selected.value && l.code === selected.value) ||
          l.name === selected ||
          (selected.data && l.name === selected.data.name)
        );
        
        if (lang) {
          langCode = lang.code;
          langName = lang.name;
          langNativeName = lang.nativeName;
        } else {
          // Default to English if we can't find the language
          langCode = 'en';
          langName = 'English';
          langNativeName = 'English';
        }
      }
      
      // Set the language
      setLanguage(langCode);
      
      // Add a new prompt line using the terminal event
      eventBus.emit(TERMINAL_EVENTS.INPUT_FOCUS);
    }
  );
}

/**
 * Handle the set lang command
 * @param {string} fullCommand - Full command with parameters
 * @returns {string} Language change result
 */
function handleSetLangCommand(fullCommand) {
  const parts = fullCommand.split(' ');
  if (parts.length < 3) {
    return showLanguageMenu();
  }
  
  const langCode = parts[2].toLowerCase();
  return setLanguage(langCode);
}

/**
 * Set the terminal language
 * @param {string|Object} langInput - Language code or selected menu item
 * @returns {Promise<string>} Result message
 */
function setLanguage(langInput) {
  // Extract the language code from the input
  let langCode;
  
  if (typeof langInput === 'object' && langInput !== null) {
    // If it's a menu selection object
    console.log('Language input is an object:', langInput);
    langCode = langInput.value;
  } else {
    // If it's a direct string code
    langCode = langInput;
  }
  
  console.log('Setting language to:', langCode);
  
  return i18n.setLanguage(langCode)
    .then(success => {
      if (success) {
        window.currentLanguage = langCode;
        localStorage.setItem('simplets_language', langCode);
        
        // Emit an event that the language has changed
        eventBus.emit('language:changed', { language: langCode });
        
        // Return plain text for CommandProcessor to handle
        return `${i18n.t('languageChanged')} ${langCode}`; 
      } else {
        return i18n.t('invalidLanguage'); // Return plain text
      }
    })
    .catch(error => {
      console.error('Error setting language:', error);
      return i18n.t('invalidLanguage'); // Return plain text
    });
}

// Register command and its help text
CommandRegistry.registerHelpText('language', {
  description: 'Displays and changes the terminal language',
  usage: 'language [language-code]',
  examples: ['language', 'language en']
});

// Use event system to categorize the command
eventBus.emit(COMMAND_EVENTS.REGISTER, {
  name: 'language',
  handler: handleLanguageCommand,
  category: 'settings',
  hidden: false
});

// Register hidden command for setting language
CommandRegistry.registerHelpText('set lang', {
  description: 'Sets the terminal language',
  usage: 'set lang [language-code]',
  examples: ['set lang en', 'set lang es']
});

// Use event system to categorize the hidden command
eventBus.emit(COMMAND_EVENTS.REGISTER, {
  name: 'set lang',
  handler: handleSetLangCommand,
  category: 'settings',
  hidden: true
});

export { handleLanguageCommand, handleSetLangCommand, setLanguage };
