/**
 * Command Descriptions
 * 
 * This file registers help text for all commands to provide descriptions
 * that will be shown in the help command output.
 */

import CommandRegistry from './registry.js';

// Register help text for all commands
function registerCommandDescriptions() {
  // Core commands
  CommandRegistry.registerHelpText('help', {
    description: 'Display a list of all available commands'
  });
  
  CommandRegistry.registerHelpText('clear', {
    description: 'Clear the terminal screen'
  });
  
  CommandRegistry.registerHelpText('about', {
    description: 'Display information about SIMPLETS'
  });
  
  CommandRegistry.registerHelpText('manifesto', {
    description: 'View the SIMPLETS manifesto or choose from different manifestos'
  });
  
  CommandRegistry.registerHelpText('roadmap', {
    description: 'View the project roadmap and future plans'
  });
  
  CommandRegistry.registerHelpText('team', {
    description: 'Learn about the SIMPLETS team members'
  });
  
  CommandRegistry.registerHelpText('legal', {
    description: 'View legal information and disclaimers'
  });
  
  CommandRegistry.registerHelpText('links', {
    description: 'Access important SIMPLETS links and resources'
  });
  
  CommandRegistry.registerHelpText('language', {
    description: 'View available languages and language settings'
  });
  
  CommandRegistry.registerHelpText('minting', {
    description: 'View information about NFT minting'
  });

  CommandRegistry.registerHelpText('opsec', {
    description: 'View operational security information'
  });
  
  CommandRegistry.registerHelpText('project', {
    description: 'View information about SIMPLETS projects'
  });
  
  CommandRegistry.registerHelpText('template', {
    description: 'View a template for creating command content with proper spacing'
  });
  
  CommandRegistry.registerHelpText('video', {
    description: 'View SIMPLETS videos'
  });
  
  CommandRegistry.registerHelpText('stop', {
    description: 'Stop any running operations'
  });
}

// Initialize command descriptions
registerCommandDescriptions();

export { registerCommandDescriptions };
