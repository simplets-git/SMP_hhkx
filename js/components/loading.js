/**
 * Loading animation component
 */

import { eventBus } from '../utils/events.js';
import asciiArt from '../animations/loading/ascii-art.js';

class LoadingAnimation {
  constructor() {
    this.loadingTexts = [
      'Initializing SIMPLETS kernel...',
      'Loading system modules...',
      'Configuring network interfaces...',
      'Mounting filesystems...',
      'Authenticating system...',
      'Preparing terminal environment...'
    ];
    this.textInterval = null;
  }

  /**
   * Initialize the loading animation
   */
  init() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = document.getElementById('loading-text');
    const asciiArtElement = document.getElementById('ascii-art');
    
    // Set ASCII art content
    if (asciiArtElement) {
      asciiArtElement.textContent = asciiArt;
    }
    
    // Show ASCII art after a short delay
    setTimeout(() => {
      if (asciiArtElement) asciiArtElement.classList.add('visible');
      
      // Show initial loading text
      if (loadingText) {
        loadingText.classList.add('visible');
        
        // Cycle through loading messages
        let currentIndex = 0;
        loadingText.textContent = this.loadingTexts[currentIndex];
        
        this.textInterval = setInterval(() => {
          currentIndex = (currentIndex + 1) % this.loadingTexts.length;
          loadingText.textContent = this.loadingTexts[currentIndex];
        }, 800);
        
        // Complete loading after 4 seconds
        setTimeout(() => {
          clearInterval(this.textInterval);
          
          // Make sure terminal is ready before fading out loading screen
          const terminal = document.getElementById('terminal');
          if (terminal && window.innerWidth > 768) {
            terminal.style.display = 'flex';
            terminal.style.opacity = '0';
          }
          
          // Short delay to ensure terminal is rendered
          setTimeout(() => {
            // Fade out loading screen
            loadingScreen.classList.add('fade-out');
            
            // After fade out begins, start fading in the terminal
            setTimeout(() => {
              if (terminal) {
                terminal.style.transition = 'opacity 0.5s ease-in-out';
                terminal.style.opacity = '1';
              }
              
              // After fade out completes
              setTimeout(() => {
                loadingScreen.style.display = 'none';
                document.body.classList.remove('loading');
                
                // Show terminal for desktop
                if (window.innerWidth > 768) {
                  // Emit event that loading is complete
                  eventBus.emit('loading:complete');
                }
              }, 500);
            }, 300);
          }, 200);
        }, 4000);
      }
    }, 300);
  }
}

export default new LoadingAnimation();
