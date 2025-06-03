/**
 * Terminal Configuration
 * 
 * Central configuration object for the SIMPLETS Terminal application.
 * Contains version information, user settings, and available commands.
 */

// Default configuration
const CONFIG = {
    version: 'v0.8.0',
    username: 'anonymous',
    hostname: 'simplets',
    availableCommands: [
        'about', 'project', 'minting', 'roadmap',
        'team', 'manifesto', 'links', 'legal',
        'video', 'stop', 'language', 'cursor'
    ],
    cursorStyle: 'underscore' // Default cursor style
};

export default CONFIG;