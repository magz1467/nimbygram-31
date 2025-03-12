
/**
 * Simple performance tracking utility for the search flow
 */
export class SearchPerformanceTracker {
  private markers: Record<string, number> = {};
  private measures: Record<string, number> = {};
  private counter: Record<string, number> = {};
  private metadata: Record<string, any> = {};
  
  constructor(private readonly context: string) {
    this.mark('init');
  }
  
  /**
   * Record a timestamp marker
   */
  public mark(name: string): void {
    this.markers[name] = performance.now();
  }
  
  /**
   * Measure time between two markers
   */
  public measure(name: string, startMark: string, endMark: string): number {
    if (!this.markers[startMark] || !this.markers[endMark]) {
      console.warn(`Cannot measure ${name}: missing markers`);
      return -1;
    }
    
    const duration = this.markers[endMark] - this.markers[startMark];
    this.measures[name] = duration;
    return duration;
  }
  
  /**
   * Increment a counter
   */
  public increment(name: string): number {
    this.counter[name] = (this.counter[name] || 0) + 1;
    return this.counter[name];
  }
  
  /**
   * Add metadata to the performance tracking
   */
  public addMetadata(key: string, value: any): void {
    this.metadata[key] = value;
  }
  
  /**
   * Get the current performance data
   */
  public getReport(): Record<string, any> {
    const report = {
      context: this.context,
      timestamp: new Date().toISOString(),
      duration: {},
      markers: { ...this.markers },
      counts: { ...this.counter },
      metadata: { ...this.metadata }
    };
    
    // Add durations for common operations
    if (this.markers['coordinatesStart'] && this.markers['coordinatesEnd']) {
      report.duration['coordinates'] = this.markers['coordinatesEnd'] - this.markers['coordinatesStart'];
    }
    
    if (this.markers['searchStart'] && this.markers['searchEnd']) {
      report.duration['search'] = this.markers['searchEnd'] - this.markers['searchStart'];
    }
    
    if (this.markers['renderStart'] && this.markers['renderEnd']) {
      report.duration['render'] = this.markers['renderEnd'] - this.markers['renderStart'];
    }
    
    // Add all explicit measurements
    Object.keys(this.measures).forEach(key => {
      report.duration[key] = this.measures[key];
    });
    
    // Overall time if we have init and current markers
    if (this.markers['init']) {
      report.duration['total'] = performance.now() - this.markers['init'];
    }
    
    return report;
  }
  
  /**
   * Log the performance report to console
   */
  public logReport(): Record<string, any> {
    const report = this.getReport();
    console.info(`📊 Performance Report [${this.context}]:`, report);
    return report;
  }
}

// Create a singleton instance for global access
let activeTracker: SearchPerformanceTracker | null = null;

export function getSearchPerformanceTracker(context?: string): SearchPerformanceTracker {
  if (!activeTracker && context) {
    activeTracker = new SearchPerformanceTracker(context);
  } else if (!activeTracker) {
    activeTracker = new SearchPerformanceTracker('global');
  } else if (context && context !== activeTracker.getReport().context) {
    // If context changes, create a new tracker but log the old one first
    activeTracker.logReport();
    activeTracker = new SearchPerformanceTracker(context);
  }
  
  return activeTracker;
}

export function resetSearchPerformanceTracker(): void {
  if (activeTracker) {
    activeTracker.logReport();
  }
  activeTracker = null;
}
