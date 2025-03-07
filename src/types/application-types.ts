
export type FilterType = {
  status?: string;
  type?: string;
  [key: string]: string | undefined;
};

export type StatusType = 'Under Review' | 'Approved' | 'Declined' | 'Other';

export type SortType = 'closingSoon' | 'newest' | 'impact' | 'distance' | null;

export type StatusCounts = {
  'Under Review': number;
  'Approved': number;
  'Declined': number;
  'Other': number;
};
