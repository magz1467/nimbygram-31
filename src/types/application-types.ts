
import { Application } from './planning';

export type SortType = 'newest' | 'distance' | 'closingSoon';

export interface ApplicationFilterState {
  status?: string;
  type?: string;
  search?: string;
  developer?: string;
  impact?: string;
  closing?: string;
}

export interface SavedApplicationProps {
  application: Application;
  onSelectApplication: (id: number) => void;
  onRemove: (id: number) => void;
}

export interface ApplicationSortConfig {
  type: SortType | null;
  applications: Application[];
}

export interface FilterProps {
  onFilterChange: (filterType: string, value: string) => void;
  activeFilters: {
    status?: string;
    type?: string;
    [key: string]: string | undefined;
  };
}

export interface ApplicationPreviewProps {
  application: Application;
  onClose: () => void;
}

export interface ApplicationDetailsProps {
  application: Application;
  onClose: () => void;
}
