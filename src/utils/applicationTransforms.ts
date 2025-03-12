
import { Application } from '@/types/planning';

export interface StatusCounts {
  'Under Review': number;
  'Approved': number;
  'Declined': number;
  'Other': number;
}

export function calculateStatusCounts(applications: Application[]): StatusCounts {
  return applications.reduce((counts: StatusCounts, app) => {
    // Initialize with default values if this is the first iteration
    if (!counts['Under Review']) counts['Under Review'] = 0;
    if (!counts['Approved']) counts['Approved'] = 0;
    if (!counts['Declined']) counts['Declined'] = 0;
    if (!counts['Other']) counts['Other'] = 0;
    
    const status = app.status || 'Other';
    const category = status.includes('Under Review') ? 'Under Review' :
                    status.includes('Approved') ? 'Approved' :
                    status.includes('Declined') ? 'Declined' : 'Other';
    counts[category]++;
    return counts;
  }, {
    'Under Review': 0,
    'Approved': 0,
    'Declined': 0,
    'Other': 0
  });
}
