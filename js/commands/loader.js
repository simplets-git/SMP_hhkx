/**
 * Command Loader
 * 
 * Imports all available commands to ensure they're registered with the CommandRegistry.
 */

// Import all command modules
import './about.js';
import './clear.js';
import './help.js';
import './language.js';
import './legal.js';
import './links.js';
import './manifesto.js';
import './minting.js';
import './opsec.js';
import './project.js';
import './roadmap.js';
import './team.js';
import './template.js';
import './video.js';
import './stop.js';

// Log that commands have been loaded
console.log('All commands loaded successfully');

// Export a simple function to verify loading
export function verifyCommandsLoaded() {
  return true;
}
