/**
 * Simplified Matrix-style Text Animation
 * 
 * Features:
 * - Dynamic grid resizing.
 * - Globally triggered random character changes.
 * - Slow fade transitions for character changes.
 * - Chance for characters to become empty spaces.
 */

import { eventBus } from '../../utils/events.js'; // Assuming eventBus might be used later for theme, etc.

const CONFIG = {
    CELL_HEIGHT: 22,
    CHAR_WIDTH: 9.6,
    FONT_SIZE: 18, // Should match CSS
    MATRIX_CHARS: [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '+', '-', '* ', '/', '=', '<', '>', '!', '?', '@', '#', '$', '%', '&'
    ],
    DEFAULT_WIDTH: 300, // For left side responsive calculation
    RESIZE_DEBOUNCE: 150,
    
    EMPTY_CELL_PROBABILITY_INITIAL: 0.25,
    GLOBAL_CHANGE_INTERVAL_MIN: 3750,
    GLOBAL_CHANGE_INTERVAL_MAX: 7500,
    FADE_DURATION: 3000,
    BECOME_EMPTY_PROBABILITY_ON_CHANGE: 0.2,
    RIGHT_SIDE_COLUMNS: 2,
    CLICK_GRACE_PERIOD: 300, // ms, time hover effect defers to a recent click
    CLICK_TRANSITION_DURATION: 1, // ms, effectively instant transition for click changes
};

function getRandomChar() {
    return CONFIG.MATRIX_CHARS[Math.floor(Math.random() * CONFIG.MATRIX_CHARS.length)];
}

class Cell {
    constructor() {
        this.char = ' ';
        this.opacity = 0; // Start fully transparent, will be faded in

        // Transition properties
        this.targetChar = ' ';
        this.targetOpacity = 0;
        this.transitionStartTime = 0;
        this.transitionDuration = 0;
        this.isTransitioning = false;
        this.onTransitionComplete = null;

        this.isHovered = false; // New property for hover state
        this.lastClickTime = 0; // Timestamp of the last click affecting this cell
    }

    // Initializes the cell without a transition (e.g., on grid creation)
    setTo(char, opacity = 1) {
        this.char = char;
        this.opacity = char === ' ' ? 0 : opacity; // Spaces are effectively 0 opacity
        this.targetChar = char;
        this.targetOpacity = this.opacity;
        this.isTransitioning = false;
    }

    startTransition(newChar, newOpacity, duration, onComplete = null) {
        if (this.isTransitioning && newChar === this.targetChar) return; // Already transitioning to this

        this.previousChar = this.char;
        this.previousOpacity = this.opacity;
        
        this.targetChar = newChar;
        this.targetOpacity = newOpacity;
        this.transitionStartTime = performance.now();
        this.transitionDuration = duration;
        this.isTransitioning = true;
        this.onTransitionComplete = onComplete;

        // If not fading out to space, the current character immediately changes for multi-step morph,
        // but for simple fade, we let opacity handle it.
        // For this simple version, we'll manage char change at the end of fade.
    }

    update(currentTime) {
        if (!this.isTransitioning) {
            return false; // Nothing to update
        }

        const elapsed = currentTime - this.transitionStartTime;
        let progress = Math.min(1, elapsed / this.transitionDuration);

        // Simple linear fade for now
        // If fading out (current char is not space, target is space OR target is different char)
        if (this.targetOpacity < this.previousOpacity) { // Fading out or cross-fading
             this.opacity = this.previousOpacity * (1 - progress);
        } 
        // If fading in (current char was space, target is not OR target is different char and we are in second half of a conceptual cross-fade)
        else if (this.targetOpacity > this.previousOpacity) { // Fading in
            this.opacity = this.targetOpacity * progress; // Assumes previousOpacity was 0 if fully faded out
        } else { // Opacity is stable, character might be changing (though not in this simple fade)
            this.opacity = this.targetOpacity;
        }
        
        this.opacity = Math.max(0, Math.min(1, this.opacity));


        if (progress >= 1) {
            const oldChar = this.char;
            this.char = this.targetChar;
            this.opacity = this.targetOpacity; // Ensure final state
            this.isTransitioning = false;
            if (this.onTransitionComplete) {
                this.onTransitionComplete();
                this.onTransitionComplete = null;
            }
            return oldChar !== this.char || this.opacity !== this.previousOpacity ; // Return true if something visually changed
        }
        return true; // Still transitioning
    }
}

class SimpleMatrixGrid {
    constructor(container, side) {
        this.container = container;
        this.side = side;
        this.element = document.createElement('div');
        this.element.className = 'simple-matrix-grid'; // Use a new class name
        this.container.appendChild(this.element);

        this.cells = []; // 2D array of Cell objects
        this.rowElements = [];
        this.columnCount = 0;
        this.rowCount = 0;
        this.lastRenderedRowHtml = [];

        this.lastGlobalChangeTime = performance.now();
        this.nextGlobalChangeInterval = this.getRandomChangeInterval();

        this.animationFrameId = null;
        this.needsRender = true; // Flag to control rendering

        this.currentlyHoveredCell = null; // To track the cell under the mouse
    }

    getRandomChangeInterval() {
        return CONFIG.GLOBAL_CHANGE_INTERVAL_MIN + 
               Math.random() * (CONFIG.GLOBAL_CHANGE_INTERVAL_MAX - CONFIG.GLOBAL_CHANGE_INTERVAL_MIN);
    }

    calculateDimensions() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        let columnCount;
        if (this.side === 'right') {
            columnCount = CONFIG.RIGHT_SIDE_COLUMNS;
        } else {
            columnCount = Math.max(1, Math.floor(width / CONFIG.CHAR_WIDTH));
        }
        const rowCount = Math.max(1, Math.ceil(height / CONFIG.CELL_HEIGHT));
        return { columnCount, rowCount, width, height };
    }

    resize() {
        const { columnCount, rowCount, width, height } = this.calculateDimensions();

        if (this.columnCount === columnCount && this.rowCount === rowCount && this.rowElements.length === rowCount) {
            // Optimization: if dimensions haven't changed, just ensure element size
            this.element.style.width = `${width}px`;
            this.element.style.height = `${height}px`;
            return;
        }
        
        this.columnCount = columnCount;
        this.rowCount = rowCount;

        this.element.innerHTML = ''; // Clear old rows
        this.rowElements = [];
        this.lastRenderedRowHtml = new Array(rowCount).fill('');
        
        const newCells = [];

        this.element.style.width = `${width}px`;
        this.element.style.height = `${height}px`;
        this.element.style.position = 'relative'; // Basic styling

        for (let y = 0; y < this.rowCount; y++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'matrix-row'; // Can reuse old CSS for .matrix-row structure
            this.element.appendChild(rowElement);
            this.rowElements.push(rowElement);

            const cellRow = [];
            for (let x = 0; x < this.columnCount; x++) {
                const cell = new Cell();
                const isInitiallyEmpty = Math.random() < CONFIG.EMPTY_CELL_PROBABILITY_INITIAL;
                const initialChar = isInitiallyEmpty ? ' ' : getRandomChar();
                cell.setTo(initialChar, 1.0); // Set directly, no transition for initial setup
                // For initial fade-in:
                // cell.setTo(' ', 0); 
                // cell.startTransition(initialChar, initialChar === ' ' ? 0 : 1, CONFIG.FADE_DURATION);
                cellRow.push(cell);
            }
            newCells.push(cellRow);
        }
        this.cells = newCells;
        this.needsRender = true; // Force full render after resize
    }

    triggerRandomCellChange(currentTime) {
        if (this.rowCount === 0 || this.columnCount === 0) return;

        // Select a random cell that is not currently hovered
        let y, x, cell;
        let attempts = 0;
        const MAX_ATTEMPTS = this.rowCount * this.columnCount > 0 ? this.rowCount * this.columnCount : 10; // Avoid infinite loop if all cells are hovered
        do {
            y = Math.floor(Math.random() * this.rowCount);
            x = Math.floor(Math.random() * this.columnCount);
            cell = this.cells[y]?.[x];
            attempts++;
        } while (cell && cell.isHovered && attempts < MAX_ATTEMPTS);

        if (!cell || cell.isHovered) { // If we couldn't find a non-hovered cell or hit max attempts
            // console.log("[TriggerChange] No non-hovered cell found or max attempts reached.");
            return; 
        }

        let newChar;
        let newOpacity;

        if (cell.char === ' ') { // If currently empty, always change to a character
            newChar = getRandomChar();
            newOpacity = 1.0;
        } else { // If has a character
            const becomesEmpty = Math.random() < CONFIG.BECOME_EMPTY_PROBABILITY_ON_CHANGE;
            if (becomesEmpty) {
                newChar = ' ';
                newOpacity = 0.0;
            } else {
                newChar = getRandomChar();
                if (newChar === cell.char) { // Avoid transitioning to the same char
                    newChar = getRandomChar(); 
                }
                newOpacity = 1.0;
            }
        }
        
        // To make it a two-stage fade (current fades out, then new fades in)
        // 1. Fade out current char (if it's not already a space)
        if (cell.char !== ' ') {
            cell.startTransition(' ', 0, CONFIG.FADE_DURATION / 2, () => {
                // 2. Once faded out, fade in the new char
                cell.char = ' '; // Ensure it's internally a space before fading in new
                cell.startTransition(newChar, newOpacity, CONFIG.FADE_DURATION / 2);
            });
        } else { // If cell is already a space, just fade in the new character
             cell.startTransition(newChar, newOpacity, CONFIG.FADE_DURATION);
        }
        this.needsRender = true;
    }

    update(currentTime) {
        let anythingChanged = false;
        for (let y = 0; y < this.rowCount; y++) {
            for (let x = 0; x < this.columnCount; x++) {
                if (this.cells[y]?.[x]?.update(currentTime)) {
                    anythingChanged = true;
                }
            }
        }
        if (anythingChanged) {
            this.needsRender = true;
        }

        // Global change trigger
        if (currentTime - this.lastGlobalChangeTime > this.nextGlobalChangeInterval) {
            this.triggerRandomCellChange(currentTime);
            this.lastGlobalChangeTime = currentTime;
            this.nextGlobalChangeInterval = this.getRandomChangeInterval();
        }
    }

    render() {
        if (!this.needsRender) return;

        for (let y = 0; y < this.rowCount; y++) {
            if (!this.rowElements[y] || !this.cells[y]) continue;
            
            const rowHtmlParts = [];
            for (let x = 0; x < this.columnCount; x++) {
                const cell = this.cells[y][x];
                if (!cell) {
                    rowHtmlParts.push('<span>&nbsp;</span>'); // Should not happen if grid is consistent
                    continue;
                }
                const displayChar = cell.char === ' ' ? '&nbsp;' : cell.char;
                // Opacity directly on span style
                rowHtmlParts.push(
                    `<span style="opacity: ${cell.opacity.toFixed(2)};">${displayChar}</span>`
                );
            }
            const newRowHtml = rowHtmlParts.join('');
            if (this.lastRenderedRowHtml[y] !== newRowHtml) {
                this.rowElements[y].innerHTML = newRowHtml;
                this.lastRenderedRowHtml[y] = newRowHtml;
            }
        }
        this.needsRender = false; 
    }

    start() {
        const animate = (time) => {
            this.update(time);
            this.render();
            this.animationFrameId = requestAnimationFrame(animate);
        };
        this.animationFrameId = requestAnimationFrame(animate);
        console.log(`Simple Matrix animation started for side: ${this.side}`);
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.container) { // General container for listeners
            if (this.side === 'left') {
                this.container.removeEventListener('mousemove', this.handleMouseMove);
                this.container.removeEventListener('mouseleave', this.handleMouseLeave);
                this.container.removeEventListener('click', this.handleGridClick);
                eventBus.off('rightSideCharacterClicked', this.handleRightSideClick); // Remove listener
            } else if (this.side === 'right') {
                this.container.removeEventListener('click', this.handleRightSideCharEmitterClick);
            }
        }
    }

    // Hover handling methods - to be bound and called by event listeners
    handleMouseMove = (event) => { // Use arrow function to bind `this` correctly
        if (this.side !== 'left') return;

        const rect = this.container.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const col = Math.floor(mouseX / CONFIG.CHAR_WIDTH);
        const row = Math.floor(mouseY / CONFIG.CELL_HEIGHT);

        let cellUnderMouse = null;
        if (row >= 0 && row < this.rowCount && col >= 0 && col < this.columnCount) {
            cellUnderMouse = this.cells[row]?.[col];
        }

        if (this.currentlyHoveredCell && this.currentlyHoveredCell !== cellUnderMouse) {
            this.currentlyHoveredCell.isHovered = false;
            // When mouse moves off, it stays '_' until global animation changes it or it gets re-hovered.
            // Or, we can trigger a fade back to its original char if we stored it.
            // For now, let it persist as per original request for the other animation.
            this.needsRender = true;
            this.currentlyHoveredCell = null;
        }

        if (cellUnderMouse && (!cellUnderMouse.isHovered || this.currentlyHoveredCell !== cellUnderMouse)) {
            if(this.currentlyHoveredCell && this.currentlyHoveredCell !== cellUnderMouse){
                 this.currentlyHoveredCell.isHovered = false; // Unhover previous one
                 this.needsRender = true;
            }
            
            // If not recently clicked, apply hover effect
            if (performance.now() - cellUnderMouse.lastClickTime > CONFIG.CLICK_GRACE_PERIOD) {
                if (!cellUnderMouse.isHovered) { // Only apply if not already marked as hovered by itself
                    cellUnderMouse.isHovered = true;
                    cellUnderMouse.isTransitioning = false; // Stop any ongoing transition
                    cellUnderMouse.char = '_';
                    cellUnderMouse.opacity = 1.0;
                    this.needsRender = true;
                }
            } // If recently clicked, isHovered might be true, but we don't override char to '_'
            // We still mark it as the currently hovered cell for tracking purposes
            this.currentlyHoveredCell = cellUnderMouse;
            // Ensure isHovered is true if it is indeed under mouse, even if click grace period is active
            if (!cellUnderMouse.isHovered) {
                cellUnderMouse.isHovered = true; // Mark as hovered for tracking, char change is conditional
            }

        } else if (!cellUnderMouse && this.currentlyHoveredCell) {
            // Mouse moved to an empty area within the box, but not over a cell
            this.currentlyHoveredCell.isHovered = false;
            this.needsRender = true;
            this.currentlyHoveredCell = null;
        }
    }

    handleMouseLeave = (event) => { // Use arrow function to bind `this` correctly
        if (this.side !== 'left') return;

        if (this.currentlyHoveredCell) {
            this.currentlyHoveredCell.isHovered = false;
            // Character remains '_' until next global update cycle changes it or it's re-hovered.
            // Or, if lastClickTime is recent, it might be something else.
            // If performance.now() - this.currentlyHoveredCell.lastClickTime <= CONFIG.CLICK_GRACE_PERIOD, it means a click just happened.
            // The character will be what the click set it to.
            // If hover was also on it, isHovered would be false now, but the char is not '_'.
            // This seems fine. The _ will re-assert if mouse moves back over it after grace period.
            this.needsRender = true;
            this.currentlyHoveredCell = null;
        }
    }

    // Click handling method
    handleGridClick = (event) => {
        if (this.side !== 'left') return;

        // Check if the click originated from within grid.element (which is this.element)
        let currentElement = event.target;
        let clickedWithinGrid = false;
        while (currentElement && currentElement !== this.container) { // Check up to sideBox (this.container)
            if (currentElement === this.element) {
                clickedWithinGrid = true;
                break;
            }
            currentElement = currentElement.parentElement;
        }

        if (!clickedWithinGrid) {
            return; // Click was outside the actual grid cells
        }

        const newRandomChar = getRandomChar();
        const currentTime = performance.now();
        let changedCount = 0;

        for (let y = 0; y < this.rowCount; y++) {
            for (let x = 0; x < this.columnCount; x++) {
                const cell = this.cells[y]?.[x];
                if (cell && cell.char === '_') { // Only change existing underscores
                    cell.lastClickTime = currentTime;
                    // Transition to the new char. Use the new fast click transition duration.
                    cell.startTransition(newRandomChar, 1.0, CONFIG.CLICK_TRANSITION_DURATION);
                    changedCount++;
                    this.needsRender = true;
                }
            }
        }

        if (changedCount > 0) {
            console.log(`[GridClick L] Changed ${changedCount} '_' to '${newRandomChar}'`);
        }
    }

    // Handler for clicks on the right side, emits event with character
    handleRightSideCharEmitterClick = (event) => {
        // Called when the right sideBox is clicked.
        // Determine which character was clicked.
        const rect = this.container.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const col = Math.floor(mouseX / CONFIG.CHAR_WIDTH);
        const row = Math.floor(mouseY / CONFIG.CELL_HEIGHT);

        if (row >= 0 && row < this.rowCount && col >= 0 && col < this.columnCount) {
            const cell = this.cells[row]?.[col];
            if (cell && cell.char !== ' ' && cell.opacity > 0.5) { // Clicked on a visible character
                console.log(`[RightSideClick] Emitting char: ${cell.char}`);
                eventBus.emit('rightSideCharacterClicked', cell.char);
            }
        }
    }

    // Handler for when a character is clicked on the right side (listened to by left grid)
    handleRightSideClick = (clickedChar) => {
        if (this.side !== 'left') return; // Only left grid reacts

        console.log(`[Left Grid] Received rightSideCharacterClicked event with char: ${clickedChar}`);
        const currentTime = performance.now();
        let changedCount = 0;

        for (let y = 0; y < this.rowCount; y++) {
            for (let x = 0; x < this.columnCount; x++) {
                const cell = this.cells[y]?.[x];
                if (cell && cell.char === '_') { // Only change existing underscores
                    cell.lastClickTime = currentTime; // Update lastClickTime to manage hover grace period
                    cell.startTransition(clickedChar, 1.0, CONFIG.CLICK_TRANSITION_DURATION);
                    changedCount++;
                    this.needsRender = true;
                }
            }
        }
        if (changedCount > 0) {
            console.log(`[Left Grid] Changed ${changedCount} '_' to clicked char '${clickedChar}' from right side.`);
        }
    }
}

// Main exported object
const SimpleMatrixAnimation = {
    create(terminal) {
        if (!terminal) {
            console.error('Terminal element not found for Simple Matrix animation');
            return;
        }
        console.log('Initializing Simple Matrix Animation...');

        const createSide = (side) => {
            const sideBox = document.createElement('div');
            sideBox.className = `terminal-side-box terminal-side-box-${side}`; // Reuse old class for basic structure
            
            // Basic positioning (can be refined by CSS)

// Basic positioning (can be refined by CSS)
sideBox.style.position = 'absolute';
sideBox.style.top = '0';
sideBox.style.bottom = '0';
sideBox.style.width = '300px'; // Initial, will be resized
sideBox.style.overflow = 'hidden';
sideBox.style.backgroundColor = 'var(--bg-color)'; // Match terminal background
sideBox.style.height = '100%'; // Explicitly set height

            if (side === 'left') {
                sideBox.style.left = '0';
            } else {
                sideBox.style.right = '0';
            }
            terminal.appendChild(sideBox);

            const grid = new SimpleMatrixGrid(sideBox, side);

            // Add listeners based on side
            if (side === 'left') {
                sideBox.addEventListener('mousemove', grid.handleMouseMove);
                sideBox.addEventListener('mouseleave', grid.handleMouseLeave);
                sideBox.addEventListener('click', grid.handleGridClick); 
                eventBus.on('rightSideCharacterClicked', grid.handleRightSideClick);
            } else if (side === 'right') {
                sideBox.addEventListener('click', grid.handleRightSideCharEmitterClick);
            }

            const handleResize = () => {
                if (sideBox.resizeTimer) clearTimeout(sideBox.resizeTimer);
                sideBox.resizeTimer = setTimeout(() => {
                    let boxWidth;
                    if (side === 'left') {
                        const idealResponsiveWidth = Math.min(CONFIG.DEFAULT_WIDTH, Math.max(100, window.innerWidth * 0.15));
                        let numCols = Math.floor(idealResponsiveWidth / CONFIG.CHAR_WIDTH);
                        // numCols += 1; // Optional: add an extra column for padding
                        boxWidth = Math.max(CONFIG.CHAR_WIDTH * 5, numCols * CONFIG.CHAR_WIDTH); // Ensure min width
                         if (boxWidth <=0) boxWidth = CONFIG.CHAR_WIDTH * 2; // Fallback
                        
                        document.documentElement.style.setProperty('--left-animation-width', `${boxWidth}px`);
                    } else { // Right side
                        boxWidth = CONFIG.CHAR_WIDTH * CONFIG.RIGHT_SIDE_COLUMNS;
                    }
                    sideBox.style.width = `${boxWidth}px`;
                     // Update CSS variable for main terminal margin or other dependent layouts
                    document.documentElement.style.setProperty(`--${side}-animation-width`, `${boxWidth}px`);
                    
                    grid.resize();
                    grid.needsRender = true; // Ensure it renders after resize

                    // Set CSS variables AND directly style elements for the left side after initial grid setup
                    if (side === 'left') {
                        // Update CSS variable for left animation panel width
                        document.documentElement.style.setProperty('--left-animation-width', `${boxWidth}px`);
                        console.log(`[SimpleMatrix L] Set CSS var --left-animation-width: ${boxWidth}px`);

                        // The offset logic has been removed as spacer rows now handle this.
                    }
                }, CONFIG.RESIZE_DEBOUNCE);
            };
            
            window.addEventListener('resize', handleResize);
            // TODO: Add theme change listener if needed, e.g., eventBus.on('theme:change', () => grid.needsRender = true);

            handleResize(); // Initial call to set dimensions and potentially CSS vars via debounced call
            grid.start();

            // Basic cleanup
            // window.addEventListener('unload', () => { // This might be too late or not always fire
            //     grid.stop();
            //     window.removeEventListener('resize', handleResize);
            // });
            // A more robust cleanup might be needed if these animations are dynamically added/removed multiple times.
        };

        createSide('left');
        createSide('right');
        
        console.log('Simple Matrix Animation setup complete for both sides.');
    }
};

export default SimpleMatrixAnimation; 