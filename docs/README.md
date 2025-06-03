# SIMPLETS Terminal

## Overview

SIMPLETS Terminal is an interactive web-based terminal interface designed as an experimental digital project with themes of digital awakening, decentralization, and creative expression. It presents itself as a "cult of digital awakening" with a focus on free speech and pseudonym-friendly values.

## Features

- Interactive command-line interface
- Dark and light themes
- Customizable animations
- Multilingual support (15+ languages)
- Video playback capabilities
- Responsive design for desktop and mobile

## Project Structure

SIMPLETS Terminal uses a modular architecture with ES Modules and a hybrid CSS approach:

```
simplets/
├── assets/               # Static assets
├── css/                  # Styling
├── js/                   # JavaScript modules
│   ├── main.js           # Application entry point
│   ├── utils/            # Utility functions
│   ├── core/             # Core terminal functionality
│   ├── components/       # UI components (cursor, menu)
│   ├── animations/       # Animation system (loading, sidebar)
│   ├── themes/           # Theme system
│   ├── commands/         # Terminal commands
│   └── i18n/             # Internationalization
└── docs/                 # Documentation
```

## Getting Started

1. Clone the repository
2. Open `index.html` in a modern browser
3. Interact with the terminal using commands like `help`, `about`, etc.

## Available Commands

- `help`: Display available commands
- `about`: Show information about SIMPLETS
- `clear`: Clear the terminal screen
- `project`: Display project information
- `manifesto`: Show the SIMPLETS manifesto
- `minting`: Display NFT minting information
- `roadmap`: Show the project roadmap
- `team`: Display team information
- `links`: Show project links
- `legal`: Display legal information
- `video`: Play the SIMPLETS video
- `stop`: Stop active processes
- `language`: Show available language options
- `set lang [code]`: Change the interface language
- `theme`: Change the terminal theme
- `animation`: Manage terminal animations

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to the project.

## Architecture

For a detailed explanation of the project architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).

## License

SIMPLETS is a VPL (Virtual Public License) project. See the [legal](legal) command in the terminal for more information.

## Browser Compatibility

SIMPLETS Terminal is designed for modern browsers with ES Module support:

- Chrome/Edge (latest versions)
- Firefox (latest versions)
- Safari (latest versions)

## Contact

For questions or feedback, reach out through the project links available via the `links` command in the terminal.