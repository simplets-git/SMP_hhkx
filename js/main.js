/**
 * Main JavaScript entrypoint
 * 
 * This file initializes the terminal application and sets up event listeners.
 */

// Import CSS

// Import core modules
import Terminal from './core/terminal.js';
import ThemeManager from './themes/manager.js';
import SettingsManager from './core/settings.js';
import CONFIG from './config.js';
import { eventBus } from './utils/events.js';
import SimpleMatrixAnimation from './animations/sidebar/simple-matrix.js';
import ThemeSwitcher from './utils/theme-switcher.js';

// Flag for conditional debug logs (unused)
const ENABLE_DEBUG_LOG = false;
// Silence default logs when debug disabled
if (!ENABLE_DEBUG_LOG) {
  console.log = () => {};
  console.debug = () => {};
}

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
  console.time('TotalStartup');
  
  // Make the app visible now that critical setup is done or initiated
  document.body.classList.remove('loading');
  console.log('Body loading class removed, app should be visible.');
  
  // Initialize theme
  ThemeManager.init();
  ThemeSwitcher.init();
  
  // Verify commands are loaded (this is likely async or quick)
  verifyCommandsLoaded();
  
  console.time('settingsInit');
  SettingsManager.init().then(() => {
    console.timeEnd('settingsInit');
    
    // Initialize the terminal AFTER settings are ready
    if (window.simplets && window.simplets.Terminal) {
      console.time('terminalInit');
      window.simplets.Terminal.initialize();
      console.timeEnd('terminalInit');
    } else {
      console.error('Terminal object not found in window.simplets');
    }
    
    // Defer matrix animation to improve perceived load time
    setTimeout(() => {
      const terminalContainer = document.getElementById('terminal-container');
      if (terminalContainer) {
        console.time('matrixInitDeferred');
        SimpleMatrixAnimation.create(terminalContainer);
        console.timeEnd('matrixInitDeferred');
      } else {
        console.error('Terminal container not found for deferred matrix animation');
      }
    }, 100); // Delay animation start by 100ms after settings/terminal init
  }).catch(error => {
    console.error('Settings initialization failed:', error);
    console.timeEnd('settingsInit');
    
    // If settings initialization fails, still initialize the terminal
    if (window.simplets && window.simplets.Terminal) {
      console.time('terminalInit');
      window.simplets.Terminal.initialize();
      console.timeEnd('terminalInit');
    } else {
      console.error('Terminal object not found in window.simplets after settings failure');
    }
  });
  
  // Add event listener for mobile logo click for theme toggling
  const mobileLogo = document.querySelector('.mobile-logo');
  if (mobileLogo) {
    mobileLogo.addEventListener('click', () => ThemeSwitcher.toggleTheme());
  }
  
  // Set version display
  const versionDiv = document.getElementById('version-display');
  if (versionDiv) {
    versionDiv.textContent = `${CONFIG.version}`;
  }
  
  // Set up side button event listeners
  setupSideButtons();
  
  // Robust terminal scroll handler using MutationObserver
  let lastTerminalOutput = null;
  let wheelHandler = null;

  function attachTerminalScrollHandler() {
    const terminalOutput = document.querySelector('.terminal-output');
    if (!terminalOutput || terminalOutput === lastTerminalOutput) return;
    if (wheelHandler) {
      window.removeEventListener('wheel', wheelHandler, { passive: false });
    }
    wheelHandler = function(event) {
      const target = event.target;
      if (target.closest('input, textarea, select, button, a, [contenteditable="true"]')) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (terminalOutput.scrollHeight > terminalOutput.clientHeight) {
        terminalOutput.scrollTop += event.deltaY;
      }
    };
    window.addEventListener('wheel', wheelHandler, { passive: false });
    lastTerminalOutput = terminalOutput;
  }

  // Observe for .terminal-output being added/replaced
  const observer = new MutationObserver(() => {
    attachTerminalScrollHandler();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  // Initial attach in case it's already present
  attachTerminalScrollHandler();

  // Logic to clear text selection on a 'true' click, not at the end of a drag-selection
  let mouseDownPos = null;
  const CLICK_THRESHOLD = 5; // Max pixels moved to be considered a click

  document.addEventListener('mousedown', (e) => {
    mouseDownPos = { x: e.clientX, y: e.clientY };
  }, true); // Use capture phase to see event early

  document.addEventListener('click', (e) => {
    // Check if the click target is the theme toggle button or its child
    let targetElement = e.target;
    let isThemeToggleClick = false;
    while (targetElement != null) {
      if (targetElement.id === 'theme-toggle') {
        isThemeToggleClick = true;
        break;
      }
      targetElement = targetElement.parentElement;
    }

    if (isThemeToggleClick) {
      // If theme toggle was clicked, don't clear selection
      mouseDownPos = null; // Still reset mousedown state
      return;
    }

    if (window.getSelection && mouseDownPos) {
      const dx = Math.abs(e.clientX - mouseDownPos.x);
      const dy = Math.abs(e.clientY - mouseDownPos.y);

      if (dx < CLICK_THRESHOLD && dy < CLICK_THRESHOLD) {
        // This is considered a 'true' click (not the end of a drag)
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && selection.type === 'Range') {
          // If there's an active text selection, clear it
          selection.removeAllRanges();
        }
      }
    }
    mouseDownPos = null; // Reset for the next mousedown sequence
  }, true); // Use capture phase for click as well

  console.timeEnd('TotalStartup');
});