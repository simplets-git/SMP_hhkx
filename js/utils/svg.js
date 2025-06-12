/**
 * SVG utility functions
 * Simplified to use CSS variables for theming
 */

const SVGUtils = {
  /**
   * Character set for random character generation
   * @private
   */
  _characterSet: [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
    'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D',
    'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7',
    '8', '9', '#', '$', '%', '-', '*', '^', '~', '+'
  ],
  
  /**
   * Generate a random character pair
   * @returns {Array<string>} A pair of random characters
   */
  getRandomCharPair() {
    const chars = this._characterSet;
    const idx1 = Math.floor(Math.random() * chars.length);
    let idx2;
    do {
      idx2 = Math.floor(Math.random() * chars.length);
    } while (idx2 === idx1);
    
    return [chars[idx1], chars[idx2]];
  },
  
  /**
   * Generate an SVG circle with characters
   * Uses CSS variables for theming to automatically adapt to theme changes
   * 
   * @param {Array<string>} chars - Two characters to display in the circle
   * @returns {string} SVG markup with theme-aware styling
   */
  generateCircleSVG(chars) {
    if (!Array.isArray(chars) || chars.length !== 2) {
      chars = this.getRandomCharPair();
    }
    
    return `
      <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" class="project-circle-svg">
        <circle cx="90" cy="90" r="90" class="project-circle" />
        <text x="90" 
              y="90" 
              dominant-baseline="central"
              font-family="var(--font-mono)" 
              style="font-size: 76.8px;"
              text-anchor="middle" 
              class="project-circle-text">
          ${chars[0]}_${chars[1]}
        </text>
      </svg>`;
  }
};

export default SVGUtils;