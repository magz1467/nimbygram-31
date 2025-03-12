import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { ErrorType } from '@/utils/errors/types';

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

  public logSearchError = async (
    coordinates: [number, number] | null,
    radius: number,
    filters: any,
    errorType: ErrorType,
    errorMessage: string,
    searchMethod: 'spatial' | 'fallback' | null
  ): Promise<void> => {
    try {
      const eventData = {
        coordinates,
        radius,
        filters,
        error_type: errorType,
        error_message: errorMessage,
        search_method: searchMethod,
        user_id: null, // Add user ID if available
        timestamp: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('search_errors')
        .insert([eventData]);

      if (error) {
        console.error('Error logging search error:', error);
      }
    } catch (err) {
      console.error('Error logging telemetry:', err);
      // Don't throw, just log the error
    }
  }

  public logSearch = async (
    searchTerm: string,
    userId?: string | null
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from('searches')
        .insert([
          {
            search_term: searchTerm,
            user_id: userId || null,
            timestamp: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error('Error logging search:', error);
      }
    } catch (err) {
      console.error('Error logging telemetry:', err);
    }
    
    // Return a resolved promise
    return Promise.resolve();
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
