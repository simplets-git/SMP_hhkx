/**
 * Video Command
 * 
 * Plays a video in the terminal
 */

import i18n from '../i18n/i18n.js';
import { eventBus } from '../utils/events.js';
import DOMUtils from '../utils/dom.js';
import CommandRegistry from './registry.js';
import { stopVideo } from './stop.js';

/**
 * Handle the video command
 * @param {string} command - Full command with parameters
 * @returns {object} Command result with suppressOutput flag
 */
function handleVideoCommand(command) {
  // Check if we're in light theme
  if (document.body.classList.contains('light-theme')) {
    return i18n.t('videoThemeWarning');
  }

  // Get the terminal element and output container
  const terminal = document.getElementById('terminal');
  const terminalOutput = document.getElementById('terminal-output');
  const themeButton = document.getElementById('theme-toggle');
  
  if (!terminal || !terminalOutput) {
    return 'Error: Terminal container not found';
  }
  
  // Store the current scroll position to restore later
  if (terminalOutput) {
    terminalOutput.dataset.scrollPosition = terminalOutput.scrollTop;
  }
  
  // Fade out the terminal content with a smooth transition
  terminalOutput.style.transition = 'opacity 0.3s ease-out';
  terminalOutput.style.opacity = '0';
  
  // Fade out the theme button
  if (themeButton) {
    themeButton.style.transition = 'opacity 0.3s ease-out';
    themeButton.style.opacity = '0';
    
    // Hide after fade completes
    setTimeout(() => {
      themeButton.style.display = 'none';
    }, 300);
  }
  
  // Create a container for the video that covers the CLI area
  const videoContainer = document.createElement('div');
  videoContainer.id = 'terminal-video-container';
  videoContainer.style.position = 'absolute';
  videoContainer.style.top = '0';
  videoContainer.style.left = '300px'; // Match the width of the left animation box
  videoContainer.style.right = '300px'; // Match the width of the right animation box
  videoContainer.style.bottom = '0';
  videoContainer.style.zIndex = '10'; // Above terminal content but below side animations
  videoContainer.style.backgroundColor = '#000';
  videoContainer.style.display = 'flex';
  videoContainer.style.alignItems = 'center';
  videoContainer.style.justifyContent = 'center';
  
  // Calculate the optimal size for the video to maintain square aspect ratio
  const availableWidth = window.innerWidth - 600; // 300px on each side for animations
  const availableHeight = window.innerHeight;
  const videoDimension = Math.min(availableWidth, availableHeight);
  
  // Create the video element
  const videoElement = document.createElement('video');
  videoElement.id = 'terminal-video';
  videoElement.src = '/video/SMP_vid.m4v';
  videoElement.autoplay = true;
  videoElement.controls = false;
  videoElement.style.width = `${videoDimension}px`;
  videoElement.style.height = `${videoDimension}px`;
  videoElement.style.objectFit = 'contain';
  
  // Add the video to the container
  videoContainer.appendChild(videoElement);
  
  // Function to restore terminal visibility with smooth transitions
  const restoreTerminal = () => {
    // Fade in the terminal content
    const terminalOutput = document.getElementById('terminal-output');
    if (terminalOutput) {
      terminalOutput.style.transition = 'opacity 0.3s ease-in';
      terminalOutput.style.opacity = '1';
      
      // Restore the scroll position
      if (terminalOutput.dataset.scrollPosition) {
        terminalOutput.scrollTop = parseInt(terminalOutput.dataset.scrollPosition, 10);
        delete terminalOutput.dataset.scrollPosition;
      }
    }
    
    // Fade in the theme button after a short delay
    setTimeout(() => {
      const themeButton = document.getElementById('theme-toggle');
      if (themeButton) {
        themeButton.style.display = 'flex';
        themeButton.style.transition = 'opacity 0.3s ease-in';
        themeButton.style.opacity = '0';
        
        // Start the fade-in after a tiny delay to ensure display:block has taken effect
        setTimeout(() => {
          themeButton.style.opacity = '1';
        }, 50);
      }
    }, 300);
  };
  
  // Handle video ending
  const handleVideoEnd = () => {
    // Fade out the video container
    videoContainer.style.transition = 'opacity 0.3s ease-out';
    videoContainer.style.opacity = '0';
    
    // Remove the container after the transition completes
    setTimeout(() => {
      videoContainer.remove();
      // Restore terminal visibility
      restoreTerminal();
    }, 300);
  };
  
  // Add event listener for when video ends
  videoElement.addEventListener('ended', () => {
    handleVideoEnd();
    eventBus.emit('video:ended');
  });
  
  // Add event listener for escape key to stop video
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      handleVideoEnd();
      document.removeEventListener('keydown', escHandler);
      eventBus.emit('video:stopped');
    }
  };
  document.addEventListener('keydown', escHandler);
  
  // Add the video container with a fade-in effect
  videoContainer.style.opacity = '0';
  terminal.appendChild(videoContainer);
  
  // Trigger fade-in after a small delay
  setTimeout(() => {
    videoContainer.style.transition = 'opacity 0.3s ease-in';
    videoContainer.style.opacity = '1';
  }, 50);
  
  eventBus.emit('video:play');
  
  // Return an object with suppressOutput flag to prevent duplicate message
  return {
    suppressOutput: true  // This will prevent the message from being displayed
  };
}

// Register command
CommandRegistry.register('video', handleVideoCommand);

export { handleVideoCommand };
