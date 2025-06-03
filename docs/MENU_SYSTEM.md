# SIMPLETS Terminal Menu System

The SIMPLETS Terminal includes a flexible menu system that allows for interactive selection within the terminal interface. This document explains how the menu system works and how to use it in your commands.

## Overview

The menu system provides a way to present users with a list of options they can navigate using keyboard controls. It's used in various commands like `manifesto`, `cursor`, and `animation` to provide an interactive selection experience.

## Architecture

The menu system consists of the following components:

1. **Menu Component** (`js/components/menu.js`): The core implementation of the menu system, providing methods to create, display, and interact with menus.

2. **Menu Utilities** (`js/utils/menu-utils.js`): Helper functions that simplify the use of menus in command handlers.

3. **Menu Styles** (`css/components/menu.css`): CSS styles for the menu appearance.

## Using Menus in Commands

To add a menu to your command, follow these steps:

### 1. Import the necessary modules

```javascript
import { showCommandMenu } from '../utils/menu-utils.js';
```

### 2. Create a menu with options

```javascript
function handleYourCommand() {
  return showCommandMenu(
    [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' }
    ],
    'Select an option:',
    (selectedValue) => {
      // This function is called when the user selects an option
      const terminalOutput = document.getElementById('terminal-output');
      const responseLine = document.createElement('div');
      responseLine.innerHTML = `You selected: ${selectedValue}`;
      terminalOutput.appendChild(responseLine);
    }
  );
}
```

### 3. Register your command

```javascript
CommandRegistry.register('yourcommand', handleYourCommand);
```

## Menu Events

The menu system emits the following events that you can listen for:

- `menu:created`: Fired when a menu is created
- `menu:selected`: Fired when an option is selected
- `menu:cancelled`: Fired when a menu is cancelled (Esc key)
- `menu:closed`: Fired when a menu is closed

Example of listening for menu events:

```javascript
import { eventBus } from '../utils/events.js';

eventBus.on('menu:selected', (data) => {
  console.log(`Selected option: ${data.value} at index ${data.index}`);
});
```

## Keyboard Navigation

The menu system supports the following keyboard controls:

- **↑/↓ Arrow Keys**: Navigate between options
- **Enter**: Select the current option
- **Esc**: Cancel the menu

## Styling Menus

Menu styles are defined in `css/components/menu.css`. You can customize the appearance by modifying this file.

## Example Implementation

For a complete example of how to use the menu system, see the `manifesto.js` or `cursor.js` command implementations in the `js/commands/` directory.
