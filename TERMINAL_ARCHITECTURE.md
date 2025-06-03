# Terminal Architecture

This document describes the architecture of the SimpleTS Terminal implementation, which follows a Model-View-Controller (MVC) pattern for better maintainability and extensibility.

## Core Components

The terminal implementation is divided into the following core components:

### 1. Terminal Core (`terminal-core.js`)

Responsible for managing the terminal state and core functionality:
- Command history management
- Prompt configuration
- Core event handling

### 2. Terminal View (`terminal-view.js`)

Handles the rendering and display of the terminal:
- Output rendering
- Command display
- Error/success/warning messages
- Cursor visual management (via CursorManager)

### 3. Terminal Controller (`terminal-controller.js`)

Manages user input and command execution:
- Command parsing and processing
- Built-in command handling
- Integration with CommandRegistry

### 4. Input Handler (`input-handler.js`)

Manages raw input events:
- Keyboard event handling
- Command submission
- History navigation
- Copy/paste behavior

### 5. Main Terminal (`terminal.js`)

Integrates all components and provides a facade for the terminal:
- Initializes all components
- Provides a simple API for external code
- Handles global events

## Event System

The terminal uses a standardized event system (`terminal-events.js`) for communication between components. This ensures consistent event naming and makes the event flow easy to follow.

Key event categories:
- Initialization events
- Command events
- Input events
- History events
- Output events
- Theme events

## How to Extend

### Adding New Commands

To add new commands to the terminal:

1. Create a new command module in the `js/commands` directory
2. Register the command using the CommandRegistry:

```javascript
import { CommandRegistry } from './registry.js';

// Register a command
CommandRegistry.registerCommand('mycommand', {
  handler: (args) => {
    // Command implementation
    return 'Command output';
  },
  help: 'Help text for my command',
  category: 'custom'
});
```

### Customizing Terminal Behavior

To customize terminal behavior:

1. Use the event system to listen for and respond to terminal events
2. Extend the appropriate component based on what you want to customize

Example:

```javascript
import { eventBus } from './utils/events.js';
import { TERMINAL_EVENTS } from './core/terminal-events.js';

// Listen for command execution
eventBus.on(TERMINAL_EVENTS.EXECUTE, (command) => {
  console.log(`Command executed: ${command}`);
});
```

### Styling

The terminal uses CSS variables for styling, which can be customized by modifying the theme files in the `css/themes` directory.

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Terminal      │     │  EventBus       │     │  Config         │
│   (Facade)      │◄────┤  (Communication)│◄────┤  (Settings)     │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         ▼
┌────────┴────────┐
│                 │
▼                 ▼                 ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  TerminalCore   │     │  TerminalView   │     │TerminalController│
│  (Model)        │◄────┤  (View)         │◄────┤  (Controller)   │
└─────────────────┘     └────────┬────────┘     └────────┬────────┘
                                 │                       │
                                 ▼                       ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │  CursorManager  │     │  CommandRegistry│
                        │                 │     │                 │
                        └─────────────────┘     └─────────────────┘
```

## Best Practices

1. Use the event system for component communication
2. Follow the established patterns for extending functionality
3. Keep components focused on their specific responsibilities
4. Use the facade (Terminal class) for external interactions
5. Document new events and functionality
