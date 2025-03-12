// This file is now a simple re-export for backward compatibility
import { transformApplicationData } from './transforms/application-transformer';

export { transformApplicationData };

export function calculateStatusCounts(applications: Application[]): StatusCounts {
  const counts: StatusCounts = {
    'Under Review': 0,
    'Approved': 0,
    'Declined': 0,
    'Other': 0
  };
  
  applications.forEach(app => {
    const status = app.status || 'Other';
    if (status.includes('Under Review')) counts['Under Review']++;
    else if (status.includes('Approved')) counts['Approved']++;
    else if (status.includes('Declined')) counts['Declined']++;
    else counts['Other']++;
  });
  
  return counts;
}
