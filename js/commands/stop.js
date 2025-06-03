/**
 * Stop Command
 * 
 * Stops video playback
 */

import DOMUtils from '../utils/dom.js';
import i18n from '../i18n/i18n.js';
import CommandRegistry from './registry.js';

/**
 * Handle the stop command
 * @returns {string} Stop result
 */
function handleStopCommand() {
  stopVideo();
  return i18n.t('videoStopped');
}

/**
 * Stop video playback
 */
function stopVideo() {
  // Look for the video container and elements
  const videoContainer = document.getElementById('terminal-video-container');
  const videoElement = document.querySelector('#terminal-video');
  const overlayToStop = document.querySelector('.video-text-overlay');
  
  // If no video is playing, do nothing
  if (!videoContainer && !videoElement) {
    return;
  }
  
  // Fade out the video container
  if (videoContainer) {
    videoContainer.style.transition = 'opacity 0.3s ease-out';
    videoContainer.style.opacity = '0';
    
    // Remove after transition completes
    setTimeout(() => {
      videoContainer.remove();
    }, 300);
  } 
  // Handle older video elements for backward compatibility
  else if (videoElement) {
    videoElement.pause();
    videoElement.style.transition = 'opacity 0.3s ease-out';
    videoElement.style.opacity = '0';
    
    setTimeout(() => {
      videoElement.remove();
    }, 300);
  }
  
  // Remove any overlay elements
  if (overlayToStop) {
    overlayToStop.style.transition = 'opacity 0.3s ease-out';
    overlayToStop.style.opacity = '0';
    
    setTimeout(() => {
      overlayToStop.remove();
    }, 300);
  }
  
  // Restore terminal visibility after video fades out
  setTimeout(() => {
    // Fade in the terminal content
    const terminalOutput = document.getElementById('terminal-output');
    if (terminalOutput) {
      terminalOutput.style.transition = 'opacity 0.3s ease-in';
      terminalOutput.style.opacity = '1';
      
      // Restore the scroll position if saved
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
        
        // Start the fade-in after a tiny delay
        setTimeout(() => {
          themeButton.style.opacity = '1';
        }, 50);
      }
    }, 300);
  }, 300); // Wait for video fade-out
}

// Register command
CommandRegistry.register('stop', handleStopCommand);

export { handleStopCommand, stopVideo };
