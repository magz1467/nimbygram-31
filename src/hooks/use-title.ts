
import { useEffect } from 'react';

/**
 * Hook to set the document title
 * @param title - The title to set
 */
export const useTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    
    // Restore the previous title when the component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};
