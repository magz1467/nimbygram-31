
import { Application } from "@/types/planning";
import { StatusCounts } from "@/types/application-types";

export function calculateStatusCounts(applications: Application[]): StatusCounts {
  const counts: StatusCounts = {
    'Under Review': 0,
    'Approved': 0,
    'Declined': 0,
    'Other': 0
  };

  applications.forEach(app => {
    const status = (app.status || '').toLowerCase();
    
    if (status.includes('review') || status.includes('pending') || status.includes('consultation')) {
      counts['Under Review']++;
    } else if (status.includes('approved') || status.includes('granted') || status.includes('permitted')) {
      counts['Approved']++;
    } else if (status.includes('declined') || status.includes('refused') || status.includes('rejected')) {
      counts['Declined']++;
    } else {
      counts['Other']++;
    }
  });

  return counts;
}
