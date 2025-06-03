/**
 * Scroll Handler
 * 
 * This utility ensures that mouse wheel scrolling works from any position
 * on the page by forwarding wheel events to the terminal while preserving
 * text selection functionality.
 */

(function() {
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    // Get terminal element
    const terminal = document.getElementById('terminal');
    
    if (!terminal) {
      console.error('[ScrollHandler] Terminal element not found');
      return;
    }
    
    // Helper function to check if text is currently selected
    const hasTextSelection = () => window.getSelection().toString().length > 0;
    
    // Helper function to check if event is within terminal
    const isEventInTerminal = (event) => terminal.contains(event.target) || terminal === event.target;
    
    // Capture wheel events on the entire document
    document.addEventListener('wheel', function(event) {
      // Don't handle if terminal doesn't exist
      if (!terminal) return;
      
      // Always allow default behavior during text selection
      if (hasTextSelection()) return;
      
      // Only handle events within the terminal
      if (isEventInTerminal(event)) {
        terminal.scrollTop += event.deltaY;
        event.preventDefault();
      }
      // Allow default scrolling behavior outside the terminal
    }, { passive: false });
    
    console.log('[ScrollHandler] Scroll handling initialized with selection support');
  });
})();
