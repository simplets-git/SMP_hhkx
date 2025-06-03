# Terminal Migration Guide

This document provides guidance for migrating from the previous terminal implementation to the new refactored architecture.

## Overview of Changes

The terminal implementation has been refactored to follow a more maintainable Model-View-Controller (MVC) pattern. Key changes include:

1. Separation of concerns into distinct components:
   - `terminal-core.js`: Core state management (Model)
   - `terminal-view.js`: Display and rendering (View)
   - `terminal-controller.js`: Command processing (Controller)
   - `input-handler.js`: Input event handling
   - `terminal.js`: Main facade integrating all components

2. Standardized event system:
   - All events are now defined in `terminal-events.js`
   - Consistent event naming and structure
   - Improved event documentation

3. Reduced code duplication:
   - Consolidated overlapping functionality
   - Clearer component boundaries
   - Better separation of concerns

## Migration Steps

### For Terminal Users

If you're using the terminal API directly:

1. Replace imports:
   ```javascript
   // Old
   import CustomTerminal from './core/custom-terminal.js';
   
   // New
   import Terminal from './core/terminal.js';
   ```

2. Update initialization:
   ```javascript
   // Old
   CustomTerminal.initialize();
   
   // New
   Terminal.initialize();
   ```

3. Update method calls:
   ```javascript
   // Old
   CustomTerminal.clear();
   CustomTerminal.write('Output');
   
   // New
   Terminal.clear();
   Terminal.write('Output');
   ```

### For Event Listeners

If you're listening to terminal events:

1. Import the standardized events:
   ```javascript
   import { TERMINAL_EVENTS } from './core/terminal-events.js';
   ```

2. Update event listeners:
   ```javascript
   // Old
   eventBus.on('terminal:command:execute', (command) => {
     // Handle command
   });
   
   // New
   eventBus.on(TERMINAL_EVENTS.EXECUTE, (command) => {
     // Handle command
   });
   ```

### For Command Developers

If you're developing commands:

1. No changes needed to the command registration API:
   ```javascript
   CommandRegistry.registerCommand('mycommand', {
     handler: (args) => {
       // Command implementation
       return 'Command output';
     },
     help: 'Help text for my command',
     category: 'custom'
   });
   ```

2. For direct terminal interaction, use the new Terminal facade:
   ```javascript
   import Terminal from './core/terminal.js';
   
   // Execute a command
   Terminal.executeCommand('clear');
   
   // Write output
   Terminal.write('Output text');
   ```

## Accessing Specific Components

If you need direct access to specific components:

```javascript
import terminalCore from './core/terminal-core.js';
import terminalView from './core/terminal-view.js';
import terminalController from './core/terminal-controller.js';

// Access command history
const history = terminalCore.getCommandHistory();

// Display custom output
terminalView.displayOutput('Custom output');

// Process a command
terminalController.processCommand('help');
```

## Event Reference

See `terminal-events.js` for a complete list of events. Key event categories:

- `INIT_EVENTS`: Initialization events
- `COMMAND_EVENTS`: Command execution events
- `INPUT_EVENTS`: Input handling events
- `HISTORY_EVENTS`: Command history events
- `OUTPUT_EVENTS`: Terminal output events
- `THEME_EVENTS`: Theme-related events

## Troubleshooting

If you encounter issues during migration:

1. Check the console for errors
2. Verify event names match those in `terminal-events.js`
3. Ensure you're using the correct component for each operation
4. Review the architecture documentation for guidance on component responsibilities
