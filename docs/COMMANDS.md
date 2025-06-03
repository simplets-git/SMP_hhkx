# SIMPLETS Terminal Commands

This document provides a comprehensive list of all available commands in the SIMPLETS Terminal interface, along with their intended functions.

## Core Commands

| Command | Description |
|---------|-------------|
| `help` | Display a list of all available commands with descriptions |
| `clear` | Clear the terminal screen |
| `about` | Display information about SIMPLETS |
| `manifesto` | View the SIMPLETS manifesto or choose from different manifestos |
| `roadmap` | View the project roadmap and future plans |
| `team` | Learn about the SIMPLETS team members |
| `legal` | View legal information and disclaimers |
| `links` | Access important SIMPLETS links and resources |

## Terminal Settings

| Command | Description |
|---------|-------------|
| `set` | Open a menu of terminal settings (font size, language, font type) |
| `set charsize` | Open a menu to select terminal font size |
| `set charsize [size]` | Change the terminal font size (12-24px) |
| `set lang` | Open a menu to select terminal language |
| `set lang [code]` | Change the terminal language |
| `set font` | Open a menu to select terminal font type |
| `set font [name]` | Change the terminal font type |
| `charsize` | Open a menu to select terminal font size with visual previews |
| `fonttype` | Open a menu to select terminal font type with visual previews |
| `language` | Open a menu to select terminal language |
| `theme` | Toggle between light and dark themes |

## Project Information

| Command | Description |
|---------|-------------|
| `minting` | View information about NFT minting |
| `project` | View project visualization and information |

## Available Font Types

The `fonttype` command allows you to select from the following fonts:

- Inconsolata (Default)
- Fira Code
- JetBrains Mono
- IBM Plex Mono
- Source Code Pro
- Ubuntu Mono
- Roboto Mono
- Courier Prime
- Space Mono

## Usage Examples

```
help                  # Show all available commands
set                   # Open settings menu with all options
set charsize          # Open font size selection menu
set charsize 16       # Set font size to 16px directly
charsize              # Open font size selection menu with visual previews
set lang              # Open language selection menu
set lang en           # Set language to English directly
language              # Open language selection menu
set font              # Open font type selection menu
set font "Fira Code"  # Change font to Fira Code directly
fonttype              # Open font type selection menu with visual previews
clear                 # Clear the terminal screen
manifesto             # Show manifesto selection menu
theme                 # Toggle between light and dark themes
```

## Menu System

Many commands in SIMPLETS Terminal use an interactive menu system:

- **Menu Navigation**: Use arrow keys (↑/↓) or number keys to select options
- **Selection**: Press Enter to select the highlighted option
- **Cancel**: Press Esc to cancel a menu and return to the command prompt

## Notes

- All commands are case-sensitive
- Commands can be used with or without arguments:
  - Without arguments (e.g., `fonttype`): Opens an interactive menu
  - With arguments (e.g., `set charsize 16`): Applies the setting directly
- The `set` command provides a centralized way to access all settings
- Font size can be adjusted between 12px and 24px
- Each font type is displayed in its actual font in the selection menu
- Language options show the language name in its native script
