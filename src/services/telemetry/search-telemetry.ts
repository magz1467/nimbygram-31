
import { supabase } from "@/integrations/supabase/client";
import { ErrorType } from "@/utils/errors/types";

// Telemetry event types
export enum TelemetryEventType {
  SEARCH_STARTED = 'search-started',
  SEARCH_COMPLETED = 'search-completed',
  SEARCH_ERROR = 'search-error',
  COORDINATES_RESOLVED = 'coordinates-resolved',
  COORDINATES_ERROR = 'coordinates-error',
  RESULTS_RENDERED = 'results-rendered',
  RESULT_INTERACTION = 'result-interaction'
}

// Search telemetry context
export interface SearchTelemetryContext {
  searchTerm?: string;
  coordinates?: [number, number] | null;
  radius?: number;
  filters?: any;
  resultCount?: number;
  duration?: number;
  errorType?: ErrorType;
  errorMessage?: string;
  searchMethod?: 'spatial' | 'fallback';
  deviceInfo?: {
    userAgent?: string;
    screenWidth?: number;
    screenHeight?: number;
    isMobile?: boolean;
  };
  [key: string]: any;
}

class SearchTelemetryService {
  private readonly SESSION_ID: string;
  private searchTimestamps: Map<string, number> = new Map();
  private enabled: boolean = true;
  
  constructor() {
    // Generate a random session ID
    this.SESSION_ID = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Check for telemetry opt-out
    try {
      const optOut = localStorage.getItem('telemetry_opt_out');
      this.enabled = optOut !== 'true';
    } catch (e) {
      console.error('Error checking telemetry opt-out status:', e);
    }
  }
  
  async logEvent(eventType: TelemetryEventType, context: SearchTelemetryContext = {}): Promise<void> {
    if (!this.enabled) return;
    
    try {
      // Add session ID
      const enhancedContext = {
        ...context,
        sessionId: this.SESSION_ID,
        timestamp: new Date().toISOString(),
        deviceInfo: {
          ...context.deviceInfo || {},
          userAgent: navigator.userAgent,
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
          isMobile: window.innerWidth < 768
        }
      };
      
      // Calculate duration for completed events
      if (eventType === TelemetryEventType.SEARCH_COMPLETED) {
        const searchKey = this.getSearchKey(context);
        const startTime = this.searchTimestamps.get(searchKey);
        
        if (startTime) {
          enhancedContext.duration = Date.now() - startTime;
          this.searchTimestamps.delete(searchKey);
        }
      } else if (eventType === TelemetryEventType.SEARCH_STARTED) {
        const searchKey = this.getSearchKey(context);
        this.searchTimestamps.set(searchKey, Date.now());
      }
      
      console.log(`Telemetry: ${eventType}`, enhancedContext);
      
      // Log to Supabase if available
      if (supabase) {
        await supabase
          .from('SearchTelemetry')
          .insert({
            event_type: eventType,
            context: enhancedContext
          })
          .catch(err => {
            console.error('Failed to log telemetry to Supabase:', err);
          });
      }
    } catch (error) {
      // Silently fail - telemetry should never break the app
      console.error('Error logging telemetry:', error);
    }
  }
  
  private getSearchKey(context: SearchTelemetryContext): string {
    const { searchTerm, coordinates, radius, filters } = context;
    return `${searchTerm}-${coordinates?.join(',')}-${radius}-${JSON.stringify(filters)}`;
  }
  
  // Allow users to opt out of telemetry
  optOut(): void {
    this.enabled = false;
    try {
      localStorage.setItem('telemetry_opt_out', 'true');
    } catch (e) {
      console.error('Error saving telemetry opt-out status:', e);
    }
  }
  
  // Allow users to opt back in
  optIn(): void {
    this.enabled = true;
    try {
      localStorage.setItem('telemetry_opt_out', 'false');
    } catch (e) {
      console.error('Error saving telemetry opt-out status:', e);
    }
  }
}

// Export singleton instance
export const searchTelemetry = new SearchTelemetryService();
