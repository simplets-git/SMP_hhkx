/**
 * Menu Utilities
 * 
 * Helper functions for working with terminal menus
 */

import DOMUtils from './dom.js';
import TerminalMenu from '../components/menu.js';
import terminalView from '../core/terminal-view.js';
import { eventBus } from './events.js';
import { TERMINAL_EVENTS } from '../core/terminal-events.js';

// Track if a menu is currently being shown to prevent multiple menus
let isShowingMenu = false;

/**
 * Helper method to show a menu with standardized handling
 * @param {Array<Object>} options - Menu options with label and value
 * @param {string} prompt - Menu prompt text
 * @param {Function} onSelect - Callback when an option is selected
 * @param {Function} [onCancel] - Optional callback when menu is cancelled
 * @returns {Object} Result object with menuActive flag
 */
function showCommandMenu(options, prompt, onSelect, onCancel) {
  // Validate inputs
  if (!Array.isArray(options) || options.length === 0) {
    console.error('Invalid menu options:', options);
    return { menuActive: false };
  }
  
  if (!prompt || typeof prompt !== 'string') {
    console.error('Invalid menu prompt:', prompt);
    return { menuActive: false };
  }
  
  // Prevent showing multiple menus simultaneously
  if (isShowingMenu) {
    console.log('Already showing a menu, ignoring request');
    return { menuActive: false };
  }
  
  // Set the flag to indicate we're showing a menu
  isShowingMenu = true;
  
  // Prepare the terminal for menu display
  prepareTerminalForMenu();
  
  // Standard callback for when menu is cancelled
  const standardOnCancel = () => {
    console.log('Menu cancelled, adding new prompt');
    handleMenuCompletion(false); // Pass false: don't add prompt from here initially
    
    // Call the custom onCancel if provided
    if (onCancel) onCancel();
  };
  
  // Create a wrapper for the onSelect callback to ensure it receives the correct data
  const onSelectWrapper = (selectedValueFromMenu, selectedIndex) => {
    console.log('Menu selection made:', selectedValueFromMenu, 'at index:', selectedIndex);

    const selectedOption = options[selectedIndex];
    const valueToPassToOriginalCallback = selectedOption.value !== undefined ? selectedOption.value : selectedOption;
    
    let messageFromCommandCallback = '';
    if (onSelect) {
      try {
        // The command's onSelect (e.g., in manifesto.js) will return the string to display
        messageFromCommandCallback = onSelect(valueToPassToOriginalCallback, selectedIndex);
      } catch (error) {
        console.error('Error in menu selection callback:', error);
        messageFromCommandCallback = 'Error processing selection.'; // Fallback message
      }
    }

    // Get the terminal output element and current max grid row
    const terminalOutput = document.getElementById('terminal-output');
    const maxGridRow = DOMUtils.getMaxGridRow(terminalOutput);
    let nextRow = maxGridRow + 1;

    // Now, display the message from the command's callback using Terminal.addMessage
    const terminalModule = window.simplets.Terminal; // Assuming Terminal instance is exposed via window.simplets
    if (terminalModule && messageFromCommandCallback && typeof messageFromCommandCallback === 'string') {
      terminalModule.addMessage(messageFromCommandCallback);
    } else if (messageFromCommandCallback) {
      // If the callback returned something but not a string (e.g. if a command was not fully refactored)
      console.warn('[menu-utils] Menu onSelect callback returned non-string:', messageFromCommandCallback);
      // Attempt to stringify or provide a generic message
      const fallbackMsg = typeof messageFromCommandCallback.message === 'string' ? messageFromCommandCallback.message : 'Selection processed.';
      if (terminalModule) terminalModule.addMessage(fallbackMsg);
    }
    
    // After displaying the message, THEN call handleMenuCompletion to add the next prompt.
    handleMenuCompletion(true); // Pass true: now it's time to add prompt
  };
  
  // Show the menu with the provided options
  const menuShown = TerminalMenu.show(
    options,
    prompt,
    onSelectWrapper,
    standardOnCancel
  );
  
  // If menu wasn't shown successfully, reset the flag
  if (!menuShown) {
    isShowingMenu = false;
    eventBus.emit(TERMINAL_EVENTS.MENU_ACTIVE, false);
  }
  
  return { menuActive: menuShown };
}

/**
 * Prepare the terminal for menu display by cleaning up existing elements
 */
function prepareTerminalForMenu() {
  // First, remove any existing menus from the DOM to prevent duplicates
  document.querySelectorAll('.terminal-menu').forEach(menu => {
    menu.remove();
  });
  
  // Reset the menu state to ensure we're starting fresh
  TerminalMenu.closeAll(false); // Don't emit events yet
  
  // Disable command lines while menu is active
  document.querySelectorAll('.command-line').forEach(line => {
    line.contentEditable = 'false';
    line.classList.add('disabled');
  });
  
  // Remove cursors to prevent duplicates
  // Cursor is now handled by custom terminal implementation
  
  // Notify the input system that a menu is active
  eventBus.emit(TERMINAL_EVENTS.MENU_ACTIVE, true);
}

/**
 * Handle menu completion (selection or cancellation)
 */
function handleMenuCompletion(shouldAddPrompt) {
  // Reset the menu showing flag
  isShowingMenu = false;
  
  // Notify the input system that menu is no longer active
  eventBus.emit(TERMINAL_EVENTS.MENU_ACTIVE, false);
  
  if (shouldAddPrompt) {
    // Use the terminal view to display a new prompt
    terminalView.displayPrompt();
    
    // Focus the input element
    if (terminalView.inputElement) {
      terminalView.inputElement.focus();
    }
  }
}

export { showCommandMenu };

