import { useEffect, useRef } from 'react';

/**
 * A hook for debugging state changes in components
 * @param componentName The name of the component for logging
 * @param props The props to watch for changes
 */
export function useDebugLogger(componentName: string, props: Record<string, any>) {
  const prevProps = useRef<Record<string, any>>({});
  
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    // Find which props changed
    const changedProps = Object.entries(props).reduce((acc, [key, value]) => {
      if (prevProps.current[key] !== value) {
        acc[key] = {
          from: prevProps.current[key],
          to: value
        };
      }
      return acc;
    }, {} as Record<string, { from: any, to: any }>);
    
    // Log changes if any
    if (Object.keys(changedProps).length > 0) {
      console.log(`[${componentName}] Props changed:`, changedProps);
    }
    
    // Update prevProps for next render
    prevProps.current = { ...props };
  });
  
  // Return nothing as this is just for debugging
  return null;
} 