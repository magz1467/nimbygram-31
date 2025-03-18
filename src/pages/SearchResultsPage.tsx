import { useSearchParams } from 'react-router-dom';
import { useApplicationData } from '../hooks/useApplicationData';
import { FilterBar } from '../components/FilterBar';
import { ApplicationList } from '../components/ApplicationList';

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const postcode = searchParams.get('postcode');
  const { applications } = useApplicationData(postcode);
  
  return (
    <div className="container mx-auto py-6">
      <FilterBar />
      <ApplicationList applications={applications} />
    </div>
  );
} 