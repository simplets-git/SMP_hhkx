/**
 * Main JavaScript entrypoint
 * 
 * This file initializes the terminal application and sets up event listeners.
 */

// Import CSS
// import '../css/main.css'; // Loaded via HTML

// Import core modules
import Terminal from './core/terminal.js';
import ThemeManager from './themes/manager.js';
import SettingsManager from './core/settings.js';
import CONFIG from './config.js';
import { eventBus } from './utils/events.js';
import SimpleMatrixAnimation from './animations/sidebar/simple-matrix.js';
import ThemeSwitcher from './utils/theme-switcher.js';

// Import commands
import { verifyCommandsLoaded } from './commands/loader.js';

// Make terminal available globally for debugging
window.simplets = {
  Terminal,
  ThemeManager,
  ThemeSwitcher,
  CONFIG,
  eventBus
};

/**
 * Set up side button event listeners
 */
function setupSideButtons() {
  // Wallet connect button
  const walletConnectBtn = document.getElementById('wallet-connect-btn');
  if (walletConnectBtn) {
    walletConnectBtn.addEventListener('click', () => {
      // Execute the wallet command
      document.dispatchEvent(new CustomEvent('command:execute', { 
        detail: { command: 'wallet' }
      }));
    });
  }
  
  // Mint button
  const mintBtn = document.getElementById('mint-btn');
  if (mintBtn) {
    mintBtn.addEventListener('click', () => {
      // Execute the mint command
      document.dispatchEvent(new CustomEvent('command:execute', { 
        detail: { command: 'mint' }
      }));
    });
  }
  
  // Winamp button
  const winampBtn = document.getElementById('winamp-btn');
  if (winampBtn) {
    winampBtn.addEventListener('click', () => {
      // Execute the music command
      document.dispatchEvent(new CustomEvent('command:execute', { 
        detail: { command: 'music' }
      }));
    });
  }
  
  // Theme button functionality is now handled by ThemeSwitcher
}

// Document ready event
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Initializing application');
  
  // Initialize theme
  ThemeManager.init();
  console.log('Theme manager initialized');
  
  // Initialize theme switcher
  ThemeSwitcher.init();
  console.log('Theme switcher initialized');
  
  // Initialize settings manager
  SettingsManager.init().then(() => {
    console.log('Settings manager initialized successfully');
    
    // Initialize the terminal AFTER settings are ready
    if (window.simplets && window.simplets.Terminal) {
      console.log('Initializing terminal from settings callback');
      window.simplets.Terminal.initialize();
    } else {
      console.error('Terminal object not found in window.simplets');
    }
    
    // Initialize matrix animation
    const terminalContainer = document.getElementById('terminal-container');
    if (terminalContainer) {
      SimpleMatrixAnimation.create(terminalContainer);
      console.log('Matrix animation initialized');
    } else {
      console.error('Terminal container not found for matrix animation');
    }
  }).catch(error => {
    console.error('Settings initialization failed:', error);
    
    // If settings initialization fails, still initialize the terminal
    if (window.simplets && window.simplets.Terminal) {
      console.log('Initializing terminal after settings failure');
      window.simplets.Terminal.initialize();
    } else {
      console.error('Terminal object not found in window.simplets after settings failure');
    }
  });
  
  // Add event listener for mobile logo click for theme toggling
  const mobileLogo = document.querySelector('.mobile-logo');
  if (mobileLogo) {
    mobileLogo.addEventListener('click', () => ThemeSwitcher.toggleTheme());
    console.log('Mobile logo click handler initialized');
  }
  
  // Set version display
  const versionDiv = document.getElementById('version-display');
  if (versionDiv) {
    versionDiv.textContent = `Version: ${CONFIG.version}`;
    console.log(`Version set to ${CONFIG.version}`);
  }
  
  // Set up side button event listeners
  setupSideButtons();
  console.log('Side buttons initialized');
});