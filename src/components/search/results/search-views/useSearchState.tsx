
import { useContext } from 'react';
import { SearchStateContext } from './SearchStateContext';

export function useSearchState() {
  const context = useContext(SearchStateContext);
  if (!context) {
    throw new Error('useSearchState must be used within a SearchStateProvider');
  }
  return context;
}
