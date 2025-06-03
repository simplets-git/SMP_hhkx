# SIMPLETS Terminal v.0.6 Documentation

## Project Overview
SIMPLETS Terminal is an interactive web-based terminal interface designed as an experimental digital project with themes of digital awakening, decentralization, and creative expression. It presents itself as a "cult of digital awakening" with a focus on free speech and pseudonym-friendly values. The application simulates a terminal/command-line interface with various commands that reveal information about the SIMPLETS project.

## Technical Architecture

### Core Files
- **index.html**: Main HTML structure of the application
- **script.js**: Core functionality and terminal command handling
- **styles.css**: Main styling for the terminal interface
- **menu-styles.css**: Styling for the terminal menu system
- **mobile-styles.css**: Responsive design for mobile devices
- **translations.js**: Multilingual support system
- **video/SMP_vid.m4v**: Video content for the video command

## Design Elements

### Theme System
- **Dark Theme (Default)**: Black background with white text
- **Light Theme**: White background with black text
- **Theme Toggle**: Available through the terminal logo (□_□) in the top right corner

### Visual Elements
1. **Loading Screen**:
   - Displays ASCII art and loading text when the application starts
   - Fades out with a scaling animation after loading completes

2. **Terminal Interface**:
   - Command prompt with customizable cursor styles
   - Output area for displaying command responses
   - Wave animation effect on the sides of the terminal

3. **Mobile View**:
   - Simplified interface for mobile devices
   - Displays a message directing users to access the full terminal on desktop

4. **Cursor Indicator**:
   - Customizable cursor style (block, underscore)
   - Blinking animation to simulate terminal cursor

5. **Menu System**:
   - Interactive selection menu for certain commands
   - Highlights selected items with a ">" prefix

## Core Functionality

### Utility Functions

#### `Utils` Object
- **`focusAndSetCursorAtEnd(element)`**: Sets focus and places cursor at the end of a text element
- **`updateVisualCursor(commandLine)`**: Updates the visual cursor position based on text content
- **`createElement(tag, classes, text)`**: Helper for creating DOM elements
- **`scrollToBottom(element)`**: Scrolls an element to its bottom
- **`focusAndSetCursorAtStart(element)`**: Sets focus and places cursor at the start of a text element
- **`fadeIn(element, duration)`**: Fades in an element with animation
- **`fadeOut(element, duration, callback)`**: Fades out an element with animation
- **`showThemeButton()`**: Shows the theme toggle button
- **`hideThemeButton()`**: Hides the theme toggle button
- **`generateRandomCharacterPairSVG(backgroundColor, indices)`**: Generates SVG with random character pairs

### Animation Modules

#### `WaveAnimation` Object
- **`create(terminal)`**: Creates wave animation on the sides of the terminal
- **`createSVGWave(side)`**: Creates SVG wave elements
- **`animateWave(currentTime)`**: Animates the wave effect

#### `CursorIndicator` Object
- **`create()`**: Creates a cursor indicator element
- **`attach(element)`**: Attaches cursor to an element
- **`updatePosition(element, cursor)`**: Updates cursor position
- **`remove(cursor)`**: Removes a cursor
- **`removeAll()`**: Removes all cursors

### Terminal System

#### `TerminalMenu` Object
- **`show(options, prompt, onSelect, onCancel)`**: Displays an interactive menu
- **`renderMenu()`**: Renders menu options
- **`handleSelection()`**: Handles menu item selection
- **`deactivateMenu()`**: Cleans up menu elements
- **`onCancel()`**: Handles menu cancellation
- **`onSelect(value, index)`**: Handles menu item selection

#### `TerminalCommands` Object
Contains handlers for all available terminal commands:
- **`handleHelpCommand()`**: Displays available commands
- **`handleAboutCommand()`**: Shows information about SIMPLETS
- **`handleStopCommand()`**: Stops active processes like video playback
- **`handleClearCommand()`**: Clears the terminal output
- **`handleVideoCommand(command)`**: Plays video content
- **`handleManifestoCommand()`**: Shows the SIMPLETS manifesto
- **`handleProjectCommand()`**: Displays project information
- **`handleMintingCommand()`**: Shows minting information
- **`handleRoadmapCommand()`**: Displays the project roadmap
- **`handleTeamCommand()`**: Shows team information
- **`handleLinksCommand()`**: Displays project links
- **`handleLegalCommand()`**: Shows legal information
- **`handleLanguageCommand()`**: Displays available languages
- **`handleSetLangCommand(fullCommand)`**: Changes the interface language

#### `TerminalInput` Object
- **`addPrompt(terminalOutput)`**: Adds a new command prompt
- **`initGlobalKeyHandling()`**: Sets up keyboard event listeners
- **`handleInput(commandLine, event)`**: Processes user input

### Translation System
- Supports 15 languages including English, German, Hindi, Chinese, Spanish, etc.
- Translation data structure in `translations.js`
- Language can be changed with the `set lang [code]` command

## Available Commands

1. **`help`**: Displays a list of available commands
2. **`about`**: Shows information about the SIMPLETS project
3. **`clear`**: Clears the terminal screen
4. **`project`**: Displays project information with SVG generation
5. **`manifesto`**: Shows the SIMPLETS manifesto with multiple manifestos to choose from
6. **`minting`**: Displays NFT minting information
7. **`roadmap`**: Shows the project roadmap in a tree structure
8. **`team`**: Displays information about the team members
9. **`links`**: Shows project-related links
10. **`legal`**: Displays legal information
11. **`video`**: Plays the SIMPLETS video
12. **`stop`**: Stops active processes like video playback
13. **`language`**: Shows available language options
14. **`set lang [code]`**: Changes the interface language
15. **`cursor`**: Changes the cursor style (hidden command)

## Event Handling

### Key Functions
- **`handleTerminalLogoClick()`**: Toggles between light and dark themes
- **`handleMobileLogoClick()`**: Toggles theme on mobile view
- **`setupTerminalInterface()`**: Initializes the terminal interface after loading
- **`initLoadingAnimation()`**: Sets up the loading screen animation

### Loading Process
1. Displays loading screen with ASCII art
2. Animates loading text
3. Fades out loading screen
4. Shows terminal interface for desktop or mobile view for mobile devices

## Responsive Design
- Desktop view: Full terminal interface with command input
- Mobile view: Simplified interface with project information and a message to use desktop for full experience
- Responsive styling with media queries for screens under 768px width

## Special Features

### SVG Generation
- Dynamically generates character pair SVGs for the project command
- Updates SVG colors based on current theme

### Video Playback
- Supports video playback within the terminal
- Warns users to switch to dark theme before playing video

### Multilingual Support
- Complete translation system for all UI elements and command responses
- Easy language switching with the `set lang [code]` command

## Technical Implementation Notes

1. The application uses vanilla JavaScript without external libraries
2. CSS variables for theme switching
3. SVG generation for visual elements
4. Custom cursor implementation for authentic terminal feel
5. Responsive design with separate mobile experience
6. Loading screen with ASCII art for immersive experience

## Conclusion

SIMPLETS Terminal is a well-designed, interactive web application that simulates a command-line interface with modern aesthetics. Its modular design, extensive feature set, and attention to visual detail make it an engaging user experience. The project balances nostalgia for terminal interfaces with modern web technologies to create a unique interactive environment.

For migration to a more open-source friendly structure, focus on modularization, improved state management, documentation, and potential framework integration while preserving the core aesthetic and interactive elements that make SIMPLETS unique.
