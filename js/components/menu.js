/**
 * Terminal Menu Component
 * 
 * Provides an interactive menu system for the terminal interface.
 * Supports keyboard navigation, selection, and cancellation.
 */

import DOMUtils from '../utils/dom.js';
import { eventBus } from '../utils/events.js';
import { TERMINAL_EVENTS } from '../core/terminal-events.js';

class TerminalMenu {
  constructor() {
    this.activeMenuId = null;
    this.isMenuActive = false;
    this.keyDownListener = null;
    this.inputBlockerListener = null;
    
    // Listen for events
    eventBus.on(TERMINAL_EVENTS.CLEAR, () => this.closeAll());
  }
  
  /**
   * Show a menu with options
   * @param {Array<Object>} options - Menu options with label and value
   * @param {string} prompt - Menu prompt text
   * @param {Function} onSelect - Callback when an option is selected
   * @param {Function} onCancel - Callback when menu is cancelled
   * @returns {boolean} Whether the menu was successfully shown
   */
  show(options, prompt, onSelect, onCancel) {
    // Validate inputs
    if (!Array.isArray(options) || options.length === 0) {
      console.error('Invalid menu options:', options);
      return false;
    }
    
    // Clean up any existing event listeners and menus
    this.cleanupEventListeners();
    this.closeAll(false); // Close but don't emit events yet
    
    // Now proceed with showing the new menu
    const terminalOutput = document.getElementById('terminal-output');
    if (!terminalOutput) {
      console.error('Terminal output element not found');
      return false;
    }
    
    let selected = 0;
    const menuId = 'menu-' + Date.now();
    this.activeMenuId = menuId;
    this.isMenuActive = true;
    
    // Emit event that menu is active
    eventBus.emit(TERMINAL_EVENTS.MENU_ACTIVE, true);
    
    // Get the current max grid row for positioning menu items
    const maxGridRow = DOMUtils.getMaxGridRow(terminalOutput);
    let nextRow = maxGridRow + 1;
    
    // Function to render the menu
    const renderMenu = () => {
      // Remove any existing menu with this ID before rendering
      const existingMenu = document.getElementById(menuId);
      if (existingMenu) existingMenu.remove();

      // Create the menu container with consistent styling
      const menuContainer = document.createElement('div');
      menuContainer.id = menuId;
      menuContainer.className = 'terminal-menu active terminal-styled-text';
      menuContainer.dataset.menuId = menuId; // Add data attribute for identification

      // Create menu title with consistent styling
      const titleElement = document.createElement('div');
      titleElement.className = 'menu-title terminal-row';
      titleElement.innerHTML = `<em>${prompt} (Use ↑/↓, Enter to confirm, Esc to cancel):</em>`;
      titleElement.style.gridRow = nextRow.toString();
      titleElement.setAttribute('data-grid-row', nextRow.toString());
      nextRow++;
      
      menuContainer.appendChild(titleElement);

      // Create menu list
      const menuList = document.createElement('ul');
      menuList.className = 'manifesto-menu';

      // Add menu items
      options.forEach((opt, i) => {
        const menuItem = document.createElement('li');
        menuItem.className = 'menu-item terminal-row' + (i === selected ? ' selected' : '');
        menuItem.style.gridRow = nextRow.toString();
        menuItem.setAttribute('data-grid-row', nextRow.toString());
        nextRow++;
        
        // Handle HTML content in labels
        if (opt.html) {
          menuItem.innerHTML = opt.label;
        } else {
          menuItem.textContent = opt.label;
        }
        
        menuList.appendChild(menuItem);
      });

      menuContainer.appendChild(menuList);
      terminalOutput.appendChild(menuContainer);
      DOMUtils.scrollToBottom(terminalOutput);
    };
    
    // Function to handle selection
    const handleSelection = () => {
      // Log for debugging
      console.log('Menu selection made at index:', selected);
      
      // Get selected option and value
      const selectedOption = options[selected];
      const selectedValue = selectedOption.value !== undefined ? selectedOption.value : selectedOption;

      // Clean up event listeners
      this.cleanupEventListeners();

      // Mark menu as inactive and selected, but keep it on screen
      const menuElement = document.getElementById(menuId);
      if (menuElement) {
        menuElement.className = 'terminal-menu inactive selected';
        // Visually mark the selected list item
        const listItems = menuElement.querySelectorAll('.menu-item');
        if (listItems && listItems[selected]) {
          listItems.forEach(item => item.classList.remove('final-selection'));
          listItems[selected].classList.add('final-selection');
        }
      }

      // Reset menu state before calling the callback
      // This is important so that if the callback shows another menu, it won't be blocked
      this.activeMenuId = null;
      this.isMenuActive = false;
      
      // Emit event for menu selection and menu active state
      eventBus.emit(TERMINAL_EVENTS.MENU_SELECTED, { value: selectedValue, index: selected });
      eventBus.emit(TERMINAL_EVENTS.MENU_ACTIVE, false);
      
      // Call the external onSelect callback
      try {
        if (onSelect) {
          onSelect(selectedValue, selected);
        }
      } catch (error) {
        console.error('Error in menu selection callback:', error);
        // Ensure we add a prompt if there's an error
        const termOutput = document.getElementById('terminal-output');
        const promptLine = document.createElement('div');
        promptLine.className = 'prompt-line terminal-styled-text terminal-row';
        termOutput.appendChild(promptLine);
      }
    };
    
    // Block all keyboard input during menu (except menu navigation)
    const inputBlocker = e => {
      if (!(e.ctrlKey || e.metaKey) && e.key !== 'Escape' && 
          e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.key !== 'Enter') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    // Store the listener reference for later cleanup
    this.inputBlockerListener = inputBlocker;
    document.addEventListener('keydown', inputBlocker, true);
    
    // Menu key handler
    const onKeyDown = e => {
      // Allow copy command to work
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') return;

      // Handle menu navigation
      switch(e.key) {
        case 'ArrowUp':
          selected = (selected - 1 + options.length) % options.length;
          renderMenu();
          break;
        case 'ArrowDown':
          selected = (selected + 1) % options.length;
          renderMenu();
          break;
        case 'Enter':
          handleSelection();
          e.preventDefault();
          e.stopPropagation();
          break;
        case 'Escape':
          // Clean up event listeners
          this.cleanupEventListeners();
          
          // Deactivate menu but keep it visible
          const menu = document.getElementById(menuId);
          if (menu) {
            menu.classList.remove('active');
            menu.classList.add('inactive');
            // Don't add 'selected' class since no option was selected
          }
          
          // Reset menu state
          this.activeMenuId = null;
          this.isMenuActive = false;
          
          // Emit event for menu cancellation and menu active state
          eventBus.emit(TERMINAL_EVENTS.MENU_CANCELLED);
          eventBus.emit(TERMINAL_EVENTS.MENU_ACTIVE, false);
          
          // Call cancel callback
          if (onCancel) onCancel();
          
          break;
        default:
          // Allow keypress for alphanumeric keys to jump to matching options
          if (/^[a-zA-Z0-9]$/.test(e.key)) {
            let foundMatch = false;
            // Find the first option that starts with the pressed key
            for (let i = 0; i < options.length; i++) {
              const label = typeof options[i] === 'string' ? options[i] : options[i].label;
              if (label.toLowerCase().startsWith(e.key.toLowerCase())) {
                selected = i;
                foundMatch = true;
                break;
              }
            }
            if (foundMatch) {
              renderMenu();
            }
          }
          e.preventDefault();
          e.stopPropagation();
      }
    };
    
    // Store the listener reference for later cleanup
    this.keyDownListener = onKeyDown;
    document.addEventListener('keydown', onKeyDown);
    
    // Initial render
    renderMenu();
    
    return true;
  }
  
  /**
   * Check if a menu is currently active
   * @returns {boolean} Whether a menu is active
   */
  isActive() {
    return this.isMenuActive;
  }
  
  /**
   * Clean up event listeners
   */
  cleanupEventListeners() {
    if (this.keyDownListener) {
      document.removeEventListener('keydown', this.keyDownListener);
      this.keyDownListener = null;
    }
    
    if (this.inputBlockerListener) {
      document.removeEventListener('keydown', this.inputBlockerListener, true);
      this.inputBlockerListener = null;
    }
  }
  
  /**
   * Close all active menus
   * @param {boolean} emitEvents - Whether to emit events
   */
  closeAll(emitEvents = true) {
    if (emitEvents) {
      if (this.activeMenuId) {
        eventBus.emit(TERMINAL_EVENTS.MENU_CLOSED);
        eventBus.emit(TERMINAL_EVENTS.MENU_ACTIVE, false);
      }
    }
    
    // Remove all menu containers
    document.querySelectorAll('.terminal-menu').forEach(menu => {
      menu.remove();
    });
    
    // Reset state
    this.activeMenuId = null;
    this.isMenuActive = false;
    
    // Clean up event listeners
    this.cleanupEventListeners();
  }
  
  /**
   * Get the active menu element
   * @returns {HTMLElement|null} The active menu element
   */
  getActiveMenu() {
    if (!this.activeMenuId) return null;
    return document.getElementById(this.activeMenuId);
  }
}

export default new TerminalMenu();
