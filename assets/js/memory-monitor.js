/* Memory Management Utility for Dan Finn's Website */

class MemoryMonitor {
  constructor() {
    this.intervals = new Set();
    this.timeouts = new Set();
    this.rafCallbacks = new Set();
    this.eventListeners = new Map();
    this.domObservers = new Set();
    
    // Log initial memory if available
    this.logMemoryUsage('Initial');
    
    // Setup cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
    
    // Monitor memory usage periodically (in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      this.startMemoryMonitoring();
    }
  }
  
  // Track and manage setInterval calls
  setInterval(callback, delay) {
    const intervalId = setInterval(callback, delay);
    this.intervals.add(intervalId);
    return intervalId;
  }
  
  clearInterval(intervalId) {
    clearInterval(intervalId);
    this.intervals.delete(intervalId);
  }
  
  // Track and manage setTimeout calls
  setTimeout(callback, delay) {
    const timeoutId = setTimeout(() => {
      callback();
      this.timeouts.delete(timeoutId);
    }, delay);
    this.timeouts.add(timeoutId);
    return timeoutId;
  }
  
  clearTimeout(timeoutId) {
    clearTimeout(timeoutId);
    this.timeouts.delete(timeoutId);
  }
  
  // Track and manage requestAnimationFrame calls
  requestAnimationFrame(callback) {
    const rafId = requestAnimationFrame((timestamp) => {
      callback(timestamp);
      this.rafCallbacks.delete(rafId);
    });
    this.rafCallbacks.add(rafId);
    return rafId;
  }
  
  cancelAnimationFrame(rafId) {
    cancelAnimationFrame(rafId);
    this.rafCallbacks.delete(rafId);
  }
  
  // Track event listeners for cleanup
  addEventListener(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, new Map());
    }
    
    const elementListeners = this.eventListeners.get(element);
    if (!elementListeners.has(event)) {
      elementListeners.set(event, new Set());
    }
    
    elementListeners.get(event).add(handler);
  }
  
  removeEventListener(element, event, handler) {
    element.removeEventListener(event, handler);
    
    const elementListeners = this.eventListeners.get(element);
    if (elementListeners && elementListeners.has(event)) {
      elementListeners.get(event).delete(handler);
    }
  }
  
  // Track DOM observers
  addObserver(observer) {
    this.domObservers.add(observer);
    return observer;
  }
  
  removeObserver(observer) {
    if (observer && typeof observer.disconnect === 'function') {
      observer.disconnect();
    }
    this.domObservers.delete(observer);
  }
  
  // Cleanup all tracked resources
  cleanup() {
    console.log('🧹 Cleaning up memory resources...');
    
    // Clear all intervals
    this.intervals.forEach(id => clearInterval(id));
    this.intervals.clear();
    
    // Clear all timeouts
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts.clear();
    
    // Cancel all animation frames
    this.rafCallbacks.forEach(id => cancelAnimationFrame(id));
    this.rafCallbacks.clear();
    
    // Remove all tracked event listeners
    this.eventListeners.forEach((eventMap, element) => {
      eventMap.forEach((handlers, event) => {
        handlers.forEach(handler => {
          element.removeEventListener(event, handler);
        });
      });
    });
    this.eventListeners.clear();
    
    // Disconnect all observers
    this.domObservers.forEach(observer => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    });
    this.domObservers.clear();
    
    this.logMemoryUsage('After Cleanup');
    console.log('✅ Memory cleanup completed');
  }
  
  // Log memory usage if performance API is available
  logMemoryUsage(label = '') {
    if (performance.memory) {
      const memory = performance.memory;
      console.log(`📊 Memory Usage ${label}:`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  }
  
  // Monitor memory usage in development
  startMemoryMonitoring() {
    const monitorInterval = setInterval(() => {
      this.logMemoryUsage('Periodic Check');
      
      // Log active resource counts
      console.log('🎯 Active Resources:', {
        intervals: this.intervals.size,
        timeouts: this.timeouts.size,
        rafCallbacks: this.rafCallbacks.size,
        eventListeners: this.eventListeners.size,
        domObservers: this.domObservers.size
      });
    }, 30000); // Every 30 seconds
    
    this.intervals.add(monitorInterval);
  }
  
  // Get current resource counts
  getResourceStats() {
    return {
      intervals: this.intervals.size,
      timeouts: this.timeouts.size,
      rafCallbacks: this.rafCallbacks.size,
      eventListeners: this.eventListeners.size,
      domObservers: this.domObservers.size
    };
  }
}

// Create global memory monitor instance
window.memoryMonitor = new MemoryMonitor();

// Export utility functions for global use
window.safeSetInterval = (callback, delay) => window.memoryMonitor.setInterval(callback, delay);
window.safeClearInterval = (id) => window.memoryMonitor.clearInterval(id);
window.safeSetTimeout = (callback, delay) => window.memoryMonitor.setTimeout(callback, delay);
window.safeClearTimeout = (id) => window.memoryMonitor.clearTimeout(id);
window.safeRequestAnimationFrame = (callback) => window.memoryMonitor.requestAnimationFrame(callback);
window.safeCancelAnimationFrame = (id) => window.memoryMonitor.cancelAnimationFrame(id);

console.log('🛡️ Memory monitor initialized');