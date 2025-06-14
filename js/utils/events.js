/**
 * Event bus system for component communication
 * 
 * Provides a centralized event system with debugging capabilities
 */

// Configuration
const DEBUG_MODE = false; // Disable detailed event logging
const LOG_EVENTS = false; // Disable all event logs

/**
 * Event bus class with enhanced features
 */
export class EventBus {
  constructor() {
    this.events = {};
    this.debugMode = DEBUG_MODE;
    this.logEvents = LOG_EVENTS;
    this.history = [];
    this.maxHistoryLength = 100;
  }
  
  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Function to call when event is emitted
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    if (this.debugMode) {
      console.debug(`[EventBus] Subscribed to '${event}', current listeners: ${this.events[event].length + 1}`);
    }
    
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }
  
  /**
   * Subscribe to an event, but only trigger once
   * @param {string} event - Event name
   * @param {Function} callback - Function to call when event is emitted
   * @returns {Function} Unsubscribe function
   */
  once(event, callback) {
    const onceWrapper = (data) => {
      callback(data);
      this.off(event, onceWrapper);
    };
    
    return this.on(event, onceWrapper);
  }
  
  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Function to remove
   */
  off(event, callback) {
    if (!this.events[event]) return;
    
    const initialLength = this.events[event].length;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
    
    if (this.debugMode && initialLength !== this.events[event].length) {
      console.debug(`[EventBus] Unsubscribed from '${event}', remaining listeners: ${this.events[event].length}`);
    }
  }
  
  /**
   * Emit an event with data
   * @param {string} event - Event name
   * @param {any} data - Data to pass to event handlers
   */
  emit(event, data) {
    if (this.logEvents) {
      console.log(`[EventBus] Event '${event}' emitted:`, data);
    }
    
    // Record in history
    this.recordEvent(event, data);
    
    if (!this.events[event]) {
      if (this.debugMode) {
        console.debug(`[EventBus] Event '${event}' emitted but no listeners registered`);
      }
      return;
    }
    
    // Create a copy of listeners array in case handlers modify it during iteration
    const listeners = [...this.events[event]];
    
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventBus] Error in '${event}' event handler:`, error);
      }
    });
  }
  
  /**
   * Record event in history
   * @private
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  recordEvent(event, data) {
    // Only record if in debug mode
    if (!this.debugMode) return;
    
    this.history.push({
      event,
      data,
      timestamp: new Date().toISOString()
    });
    
    // Keep history at reasonable size
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }
  }
  
  /**
   * Get event history
   * @returns {Array} Event history
   */
  getEventHistory() {
    return [...this.history];
  }
  
  /**
   * Clear event history
   */
  clearEventHistory() {
    this.history = [];
  }
  
  /**
   * Get count of listeners for an event
   * @param {string} event - Event name
   * @returns {number} Number of listeners
   */
  listenerCount(event) {
    return this.events[event]?.length || 0;
  }
  
  /**
   * Enable or disable debug mode
   * @param {boolean} enabled - Whether debug mode should be enabled
   */
  setDebugMode(enabled) {
    this.debugMode = !!enabled;
    console.log(`[EventBus] Debug mode ${this.debugMode ? 'enabled' : 'disabled'}`);
  }
}

// Create a global event bus
let globalEventBus;
if (window.__globalEventBus) {
  globalEventBus = window.__globalEventBus;
} else {
  globalEventBus = new EventBus();
  globalEventBus.setDebugMode(DEBUG_MODE);
  globalEventBus._debugId = Math.floor(Math.random() * 1000000);
  window.eventBus = globalEventBus;
  window.__globalEventBus = globalEventBus;
}
export const eventBus = globalEventBus;