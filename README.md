# SIMPLETS Terminal v0.8.0

SIMPLETS Terminal is an underground and experimental DeSoc journey - a web-based terminal interface designed around free speech and pseudonym-friendly values.

## Quick Start

To run the SIMPLETS Terminal:

```bash
# Using npm (recommended)
npm start

# Or using Python directly
python3 start_server.py

# To stop the server
npm run stop
# Or press Ctrl+C in the terminal where the server is running
```

The application will automatically open in your default browser at http://localhost:8080 (or another port if 8080 is already in use).

## Project Structure

```
├── assets/               # Static assets like images, videos, and audio
├── css/                  # CSS stylesheets
│   ├── animations/       # Animation styles
│   ├── components/       # Component-specific styles
│   ├── themes/           # Theme-related styles
│   ├── main.css          # Main CSS file that imports all others
│   ├── terminal-unified.css # Core terminal styling
│   ├── terminal-cursor.css  # Cursor styling
│   └── variables.css     # CSS variables and theming
├── docs/                 # Documentation files
├── js/                   # JavaScript files
│   ├── animations/       # Animation scripts
│   ├── commands/         # Terminal command implementations
│   ├── components/       # UI components
│   ├── core/             # Core functionality
│   ├── i18n/             # Internationalization
│   ├── themes/           # Theme management
│   ├── utils/            # Utility functions
│   ├── config.js         # Configuration settings
│   └── main.js           # Main entry point
├── video/                # Video files
├── index.html            # Main HTML file
├── package.json          # Node.js package configuration
├── start_server.py       # Python HTTP server
└── README.md             # This documentation file
```

## Features

- Terminal-like interface with command execution
- Theme support (light/dark)
- Mobile-responsive design
- SVG rendering support
- Wallet connect functionality
- Mint functionality
- Media playback (Winamp-like interface)

## Commands

Type `help` in the terminal to see a list of available commands.

## Development

### Running in Development Mode

```bash
npm run dev
```

### Stopping the Server

```bash
npm run stop
```

## Project Architecture

SIMPLETS Terminal is built with vanilla JavaScript using modules. The core architecture follows these principles:

1. **Modular Design**: Each feature is encapsulated in its own module
2. **Event-Driven**: Components communicate through a central event bus
3. **Themeable**: The UI is fully themeable through CSS variables
4. **Mobile-First**: Designed to be responsive, with a special mobile experience

## Browser Compatibility

SIMPLETS Terminal works best on modern browsers that support ES6 modules:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

UNLICENSED - SIMPLETS Team

## Recent Refactoring

The project has undergone significant refactoring to improve code organization, maintainability, and performance:

### CSS Cleanup and Organization
- Consolidated and reorganized CSS files to eliminate redundancy
- Improved variable naming for better consistency and readability
- Enhanced responsive design with cleaner media queries
- Standardized styling patterns across components

### Command System Improvements
- Implemented a category-based command registry
- Enhanced error handling in command execution
- Added support for command aliasing
- Improved help system with detailed command information

### Terminal Engine Enhancements
- Converted to event-driven architecture for better component decoupling
- Added comprehensive event bus with debugging capabilities
- Improved theme handling with system preference detection
- Enhanced error reporting and logging

### Performance Optimizations
- Reduced CSS duplication
- Minimized DOM manipulation operations
- Improved event handling efficiency
- Added proper error boundaries

These changes have significantly improved the codebase structure while maintaining backward compatibility.

---

© 2023-2024 SIMPLETS Team
