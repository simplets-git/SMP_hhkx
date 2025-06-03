# SIMPLETS Terminal Menu System Guide

This document explains how to implement menu-based commands in the SIMPLETS Terminal system.

## Menu Architecture Overview

The SIMPLETS Terminal uses a standardized menu system that allows for consistent user interaction across different commands. The menu system consists of:

1. **Menu Utility Functions** - Centralized in `js/utils/menu-utils.js`
2. **Command Implementations** - Individual command files in `js/commands/`
3. **Menu Component** - Core menu rendering in `js/components/menu.js`

## How to Create a New Menu Command

### Step 1: Create a Command File

Create a new JavaScript file in the `js/commands/` directory:

```javascript
/**
 * Your Command Name
 * 
 * Brief description of what your command does
 */

import DOMUtils from '../utils/dom.js';
import CommandRegistry from './registry.js';
import { formatCommandOutput } from '../utils/formatting.js';
import { showCommandMenu } from '../utils/menu-utils.js';
import { eventBus } from '../utils/events.js';

// Available options for your menu (example)
const availableOptions = [
  { name: 'Option 1', value: 'option1', description: 'Description of option 1' },
  { name: 'Option 2', value: 'option2', description: 'Description of option 2' },
  { name: 'Option 3', value: 'option3', description: 'Description of option 3' }
];

/**
 * Handle your command
 * @param {Array} args - Command arguments
 * @returns {string|Object} Command result
 */
function handleYourCommand(args) {
  // If arguments are provided, handle direct setting
  if (args && args.length > 0) {
    const optionName = args.join(' ');
    const option = availableOptions.find(o => o.name.toLowerCase() === optionName.toLowerCase());
    
    if (option) {
      return applyOption(option.value);
    } else {
      return formatCommandOutput(
        `<strong>Option not found.</strong><br>Available options:<br>` +
        availableOptions.map(o => `- <span class="terminal-command">${o.name}</span>: ${o.description}`).join('<br>')
      );
    }
  }
  
  // If no arguments, show the menu
  return showYourCommandMenu();
}

/**
 * Show a menu with available options
 * @returns {Object} Menu result
 */
function showYourCommandMenu() {
  const menuOptions = availableOptions.map(option => ({
    label: `${option.name} - ${option.description}`,
    value: option.value,
    data: option
  }));

  return showCommandMenu(
    menuOptions,
    'Select an option:',
    (selected) => {
      // Handle the selected option
      const result = applyOption(selected.value);
      
      // Display the result
      const terminalOutput = document.getElementById('terminal-output');
      const responseLine = DOMUtils.createElement('div', ['command-response', 'terminal-styled-text']);
      responseLine.innerHTML = result;
      terminalOutput.appendChild(responseLine);
      DOMUtils.scrollToBottom(terminalOutput);
    }
  );
}

/**
 * Apply the selected option
 * @param {string} optionValue - The value of the selected option
 * @returns {string} Formatted result message
 */
function applyOption(optionValue) {
  const option = availableOptions.find(o => o.value === optionValue);
  
  // Apply the option (implement your logic here)
  // For example, store in localStorage
  localStorage.setItem('your_setting_key', optionValue);
  
  // Emit an event if needed
  eventBus.emit('your:setting:changed', { value: optionValue });
  
  return formatCommandOutput(`Option set to <strong>${option.name}</strong>: ${option.description}`);
}

// Register command
CommandRegistry.register('yourcommand', handleYourCommand);

// Register help text
CommandRegistry.registerHelpText('yourcommand', {
  description: 'Description of your command',
  usage: 'yourcommand [option]',
  examples: ['yourcommand', 'yourcommand "Option 1"']
});

export { handleYourCommand };
```

### Step 2: Customize the Menu Options

For different types of menus, you can customize the options in various ways:

#### For Font Type Menus (showing different fonts):

```javascript
const menuOptions = availableFonts.map(font => ({
  label: `<span style="font-family: ${font.value}">${font.name}</span> - ${font.description}`,
  value: font.value,
  data: font
}));
```

#### For Character Size Menus (showing different sizes):

```javascript
const menuOptions = availableSizes.map(sizeOption => ({
  label: `<span style="font-size: ${sizeOption.size}px">${sizeOption.label}</span> - ${sizeOption.description}`,
  value: sizeOption.size,
  data: sizeOption
}));
```

#### For Language Menus:

```javascript
const menuOptions = availableLanguages.map(lang => ({
  label: `${lang.nativeName} (${lang.code})${lang.code === currentLang ? ' - Current' : ''}`,
  value: lang.code,
  data: lang
}));
```

### Step 3: Register with the Set Command (Optional)

If your command should be available through the `set` command, add it to the settings handlers in `js/commands/set.js`:

```javascript
import { handleYourCommand } from './yourcommand.js';

// Add to the settings object
const settings = {
  // ... existing settings
  
  // Your new setting
  yoursetting: (value, terminal) => {
    // If no value provided, show the menu
    if (!value) {
      return handleYourCommand([]);
    }
    
    // Otherwise, delegate to your command
    return handleYourCommand([value]);
  }
};
```

Then update the `showSettingsMenu` function to include your new setting:

```javascript
function showSettingsMenu() {
  const menuOptions = [
    // ... existing options
    { 
      label: 'Your Setting - Description', 
      value: 'yoursetting', 
      description: 'Brief description'
    }
  ];
  // ... rest of the function
}
```

## Using the Menu Utility

The `showCommandMenu` function is the core of the menu system:

```javascript
showCommandMenu(
  options,    // Array of menu options with label, value, and optional data
  prompt,     // Text prompt to display above the menu
  onSelect,   // Callback function when an option is selected
  onCancel    // Optional callback function when menu is cancelled
);
```

### Menu Option Format

Each menu option should have:

- `label`: HTML string to display (can include styling)
- `value`: Value to pass to the onSelect callback
- `data`: Optional additional data about the option

## Styling Considerations

- Use the `terminal-styled-text` class for consistent styling
- Use `formatCommandOutput` for standardized output formatting
- For custom styling within menu options, use inline styles sparingly

## Best Practices

1. **Consistent Naming**: Use clear, descriptive names for your commands and options
2. **Provide Help Text**: Always register help text for your command
3. **Handle Direct Setting**: Allow both menu selection and direct command arguments
4. **Emit Events**: Use the event bus to notify other components of changes
5. **Store Preferences**: Save user selections in localStorage
6. **Standardize Output**: Use the formatting utilities for consistent output

## Examples

See the following files for examples of different menu implementations:

- `js/commands/fonttype.js` - Font type selection with visual previews
- `js/commands/charsize.js` - Character size selection with size previews
- `js/commands/language.js` - Language selection with current language indicator
- `js/commands/cursor.js` - Simple option selection
- `js/commands/manifesto.js` - Content selection menu

By following this guide, you can create consistent, user-friendly menu interfaces for your SIMPLETS Terminal commands.
