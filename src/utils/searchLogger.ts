
import { supabase } from "@/integrations/supabase/client";

interface SearchLogData {
  searchTerm: string;
  type: string;
  tab?: string;
  isLoggedIn?: boolean;
  resultsCount?: number;
  duration?: number;
  errorType?: string;
}

class SearchLogger {
  private queue: SearchLogData[] = [];
  private isProcessing = false;
  private readonly MAX_RETRY = 3;
  
  /**
   * Log a search to the database and analytics
   */
  async logSearch(searchTerm: string, type: string, tab?: string, resultsCount?: number) {
    try {
      const startTime = Date.now();
      
      // Check if user is logged in (if auth is available)
      let isLoggedIn = false;
      try {
        const { data } = await supabase.auth.getSession();
        isLoggedIn = !!data.session;
      } catch (e) {
        // Ignore auth errors
      }
      
      // Prepare log data
      const logData: SearchLogData = {
        searchTerm,
        type,
        tab,
        isLoggedIn,
        resultsCount,
        duration: Date.now() - startTime
      };
      
      // Add to queue and process
      this.queue.push(logData);
      this.processQueue();
      
      return true;
    } catch (err) {
      console.error('Failed to log search:', err);
      // Don't throw - we don't want to break the app if logging fails
      return false;
    }
  }
  
  /**
   * Log a search error for analytics
   */
  logSearchError(searchTerm: string, errorType: string, errorMessage: string) {
    try {
      this.queue.push({
        searchTerm,
        type: 'error',
        errorType
      });
      
      this.processQueue();
      return true;
    } catch (e) {
      console.error('Error logging search error:', e);
      return false;
    }
  }
  
  /**
   * Process the queue of log entries
   */
  private async processQueue(retryCount = 0) {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    try {
      const item = this.queue.shift();
      if (!item) {
        this.isProcessing = false;
        return;
      }
      
      // Log to Supabase
      const { data, error } = await supabase.from('Searches').insert({
        'Post Code': item.searchTerm,
        'User_logged_in': item.isLoggedIn || false,
        'Type': item.type,
        'Tab': item.tab || null,
        'Duration': item.duration || null,
        'Results': item.resultsCount || null,
        'Error': item.errorType || null
      });
      
      if (error) {
        console.warn('Error logging search:', error);
        
        // Put the item back in the queue if we haven't retried too many times
        if (retryCount < this.MAX_RETRY) {
          this.queue.unshift(item);
          this.isProcessing = false;
          
          // Wait before retrying
          setTimeout(() => {
            this.processQueue(retryCount + 1);
          }, 1000 * (retryCount + 1));
          return;
        }
      }
      
      // Process next item
      this.isProcessing = false;
      if (this.queue.length > 0) {
        this.processQueue();
      }
    } catch (e) {
      console.error('Error in processQueue:', e);
      this.isProcessing = false;
      
      // Ensure queue continues processing even after error
      if (this.queue.length > 0) {
        setTimeout(() => {
          this.processQueue();
        }, 2000);
      }
    }
  }
}

export const searchLogger = new SearchLogger();

export const logSearch = async (searchTerm: string, type: string, tab?: string) => {
  return searchLogger.logSearch(searchTerm, type, tab);
};
