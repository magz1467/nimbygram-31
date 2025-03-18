
/**
 * Storybook Formatter Logger
 * 
 * Provides consistent logging for storybook formatting across environments
 * Helps diagnose issues between development and production
 */

// Set to true for verbose logging in any environment
const FORCE_VERBOSE = false;

// Environment detection
const isProd = typeof window !== 'undefined' && 
  window.location.hostname.includes('nimbygram.com');

// Only log verbosely in development or when forced
const isVerbose = FORCE_VERBOSE || !isProd;

export const logStorybook = {
  input: (content: string | null, applicationId?: number) => {
    if (!isVerbose) return;
    
    console.group(`📚 Storybook Input [App ID: ${applicationId || 'unknown'}]`);
    console.log('Content type:', typeof content);
    console.log('Content length:', content?.length || 0);
    if (content) {
      console.log('Content preview:', content.substring(0, 100) + '...');
    } else {
      console.log('Content is null or empty');
    }
    console.groupEnd();
  },
  
  section: (sectionType: string, content: string | string[] | null, applicationId?: number) => {
    if (!isVerbose) return;
    
    console.group(`📑 Storybook Section [${sectionType}] [App ID: ${applicationId || 'unknown'}]`);
    if (Array.isArray(content)) {
      console.log('Array content items:', content.length);
      if (content.length > 0) {
        console.log('First item preview:', content[0].substring(0, 50) + '...');
      }
    } else if (content) {
      console.log('Content length:', content.length);
      console.log('Content preview:', content.substring(0, 100) + '...');
    } else {
      console.log('Content is null or empty');
    }
    console.groupEnd();
  },
  
  output: (result: any, applicationId?: number) => {
    if (!isVerbose) return;
    
    console.group(`✅ Storybook Output [App ID: ${applicationId || 'unknown'}]`);
    console.log('Result type:', typeof result);
    console.log('Has sections:', Boolean(result?.sections?.length));
    console.log('Section count:', result?.sections?.length || 0);
    if (result?.sections?.length) {
      console.log('Section types:', result.sections.map((s: any) => s.type).join(', '));
    }
    console.groupEnd();
  },
  
  error: (stage: string, error: any, content?: string | null) => {
    // Always log errors, even in production
    console.error(`❌ Storybook Error [${stage}]:`, error);
    if (content) {
      console.error('Content preview that caused error:', 
        content.substring(0, 100) + '...');
    }
  },
  
  // Force a production-visible log for critical issues
  critical: (message: string, data?: any) => {
    console.warn(`⚠️ STORYBOOK CRITICAL: ${message}`, data);
  }
};
