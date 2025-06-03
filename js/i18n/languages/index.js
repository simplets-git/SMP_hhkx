/**
 * Language index
 * 
 * This file provides information about available languages
 * and handles lazy loading of language files.
 */

// Define available languages with metadata
export const availableLanguages = {
  en: {
    name: 'English',
    nativeName: 'English',
    isDefault: true
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español'
  },
  // Add other languages as needed
};

// Cache for loaded language modules
const loadedLanguages = {};

/**
 * Lazy load a language module
 * @param {string} lang - Language code
 * @returns {Promise<Object>} - Language translations
 */
export async function loadLanguage(lang) {
  // Return from cache if already loaded
  if (loadedLanguages[lang]) {
    return loadedLanguages[lang];
  }
  
  try {
    // Dynamic import of language file
    const module = await import(`./${lang}.js`);
    loadedLanguages[lang] = module.default;
    return module.default;
  } catch (error) {
    console.error(`Failed to load language: ${lang}`, error);
    // If the requested language fails to load, try to load English
    if (lang !== 'en') {
      console.warn(`Falling back to English`);
      return loadLanguage('en');
    }
    // If even English fails, return an empty object
    return {};
  }
}

/**
 * Get the default language code
 * @returns {string} - Default language code
 */
export function getDefaultLanguage() {
  for (const [code, meta] of Object.entries(availableLanguages)) {
    if (meta.isDefault) {
      return code;
    }
  }
  return 'en'; // Fallback to English if no default is specified
}

/**
 * Check if a language is available
 * @param {string} lang - Language code to check
 * @returns {boolean} - Whether the language is available
 */
export function isLanguageAvailable(lang) {
  return !!availableLanguages[lang];
}
