
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export enum TelemetryEventType {
  SEARCH_STARTED = 'search-started',
  SEARCH_COMPLETED = 'search-completed',
  SEARCH_ERROR = 'search-error',
  COORDINATES_RESOLVED = 'coordinates-resolved',
  COORDINATES_ERROR = 'coordinates-error'
}

interface DeviceInfo {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  isMobile: boolean;
}

interface TelemetryEvent {
  eventType: TelemetryEventType;
  sessionId: string;
  timestamp: string;
  deviceInfo: DeviceInfo;
  [key: string]: any;
}

class SearchTelemetryService {
  private sessionId: string;
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('search_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${uuidv4().substring(0, 8)}`;
      sessionStorage.setItem('search_session_id', sessionId);
    }
    return sessionId;
  }

  public disableTelemetry(): void {
    this.isEnabled = false;
  }

  public enableTelemetry(): void {
    this.isEnabled = true;
  }

  public logEvent(eventType: TelemetryEventType, data: any = {}): void {
    if (!this.isEnabled) {
      return;
    }

    const event: TelemetryEvent = {
      eventType,
      ...data,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      deviceInfo: this.getDeviceInfo()
    };

    // Log to console for development
    console.log(`Telemetry: ${eventType}`, event);
    
    try {
      // Store in Supabase with proper Promise handling
      supabase
        .from('search_telemetry')
        .insert([{
          event_type: eventType,
          search_term: data.searchTerm || '',
          coordinates: data.coordinates ? JSON.stringify(data.coordinates) : null,
          search_method: data.searchMethod || null,
          result_count: data.resultCount || null,
          error_type: data.errorType || null,
          error_message: data.errorMessage || null,
          session_id: this.sessionId,
          device_info: this.getDeviceInfo(),
          timestamp: new Date().toISOString()
        }])
        .then((response) => {
          if (response.error) {
            console.error('Error logging telemetry:', response.error);
          }
        })
        .catch((error) => {
          console.error('Error logging telemetry:', error);
        });
    } catch (error) {
      console.error('Error logging telemetry:', error);
    }
  }

  private getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      isMobile: /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768
    };
  }
}

// Export singleton instance
export const searchTelemetry = new SearchTelemetryService();
