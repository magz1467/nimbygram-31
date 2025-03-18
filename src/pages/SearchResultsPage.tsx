import { useState, useSearchParams } from 'react-router-dom';
import { useApplicationData } from '../hooks/useApplicationData';
import { FilterBar } from '../components/FilterBar';
import { SplitView } from '../components/SplitView';

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const postcode = searchParams.get('postcode');
  const [activeSort, setActiveSort] = useState('date');
  const { applications } = useApplicationData(postcode);
  
  const handleSortChange = (sortValue) => {
    setActiveSort(sortValue);
    // Implement your sorting logic here
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <FilterBar 
        activeSort={activeSort} 
        onSortChange={handleSortChange} 
      />
      <SplitView applications={applications} />
    </div>
  );
} 