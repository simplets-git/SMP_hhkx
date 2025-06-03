# Contributing to SIMPLETS Terminal

Thank you for your interest in contributing to SIMPLETS Terminal! This guide will help you understand how to contribute effectively to the project.

## Getting Started

1. **Fork the repository** and clone it locally
2. **Explore the codebase** to understand its structure
3. **Check the issues** for tasks that need help
4. **Make your changes** in a new branch
5. **Submit a pull request** with your changes

## Project Structure

SIMPLETS Terminal uses a modular architecture with ES Modules and a hybrid CSS approach. Here's a quick overview of the main directories:

```
simplets-new/
├── assets/               # Static assets
├── css/                  # Styling
├── js/                   # JavaScript modules
│   ├── main.js           # Application entry point
│   ├── utils/            # Utility functions
│   ├── core/             # Core terminal functionality
│   ├── components/       # UI components
│   ├── animations/       # Animation system
│   ├── themes/           # Theme system
│   ├── commands/         # Terminal commands
│   └── i18n/             # Internationalization
└── docs/                 # Documentation
```

For a detailed explanation of the architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Common Contribution Tasks

### Adding a New Command

1. Create a new file in `js/commands/` (e.g., `mycommand.js`)
2. Implement your command following this template:

```javascript
export function register(registry) {
  registry.register('mycommand', (args, terminal) => {
    // Your command implementation here
    return 'Output of my command';
  }, {
    description: 'Description of my command',
    usage: 'mycommand [options]'
  });
}
```

3. Import and register your command in `main.js`:

```javascript
import('./commands/mycommand.js').then(module => module.register(commandRegistry));
```

### Creating a New Theme

1. Create a CSS file in `css/themes/` (e.g., `mytheme.css`) with your theme variables
2. Create a JS file in `js/themes/` (e.g., `mytheme.js`) to register the theme:

```javascript
import { themeManager } from './manager.js';

const myTheme = {
  name: 'mytheme',
  variables: {
    '--bg-color': '#123456',
    '--text-color': '#ffffff',
    // More variables...
  }
};

themeManager.register('mytheme', myTheme);
```

3. Import your theme in `main.js`:

```javascript
import('./themes/mytheme.js');
```

### Adding a New Animation

1. Create a JS file in the appropriate animation directory (e.g., `js/animations/sidebar/myanimation.js`):

```javascript
import { animationManager } from '../manager.js';

class MyAnimation {
  constructor() {
    // Initialize properties
  }
  
  activate() {
    // Create and add your animation elements
  }
  
  deactivate() {
    // Clean up your animation
  }
}

// Register with animation manager
animationManager.register('sidebar', 'myanimation', MyAnimation);
```

2. Add any needed CSS to `css/animations/sidebar.css`
3. Import your animation in `main.js`:

```javascript
import('./animations/sidebar/myanimation.js');
```

## Coding Standards

### JavaScript

- Use ES6+ features
- Use ES Modules for imports/exports
- Follow camelCase for variables and functions
- Follow PascalCase for classes
- Add JSDoc comments for functions and classes

### CSS

- Use CSS variables for themeable properties
- Use class-based selectors (avoid IDs for styling)
- Follow kebab-case for class names
- Group related styles together

### HTML

- Use semantic HTML elements
- Ensure accessibility with proper ARIA attributes
- Keep the HTML structure clean and minimal

## Testing Your Changes

1. Open `index.html` in a modern browser
2. Test your specific feature thoroughly
3. Ensure it works with both light and dark themes
4. Check for any console errors

## Documentation

When adding new features, please update the relevant documentation in the `docs/` directory.

## Pull Request Process

1. Ensure your code follows the project's coding standards
2. Update documentation as necessary
3. Test your changes thoroughly
4. Submit a pull request with a clear description of the changes

## Code of Conduct

- Be respectful and inclusive in your communications
- Focus on constructive feedback
- Help maintain a positive community atmosphere

Thank you for contributing to SIMPLETS Terminal! Your efforts help make this project better for everyone.