import { useSearchParams } from 'react-router-dom';
import { useApplicationData } from '../hooks/useApplicationData';
import { FilterBar } from '../components/FilterBar';
import { MapComponent } from '../components/MapComponent';

export function MapView() {
  const [searchParams] = useSearchParams();
  const postcode = searchParams.get('postcode');
  const { applications } = useApplicationData(postcode);
  
  return (
    <div className="h-full">
      <FilterBar />
      <MapComponent applications={applications} />
    </div>
  );
}
