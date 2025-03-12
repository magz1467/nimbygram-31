
import { useState, useEffect } from 'react';
import { Application } from '@/types/planning';

export interface StatusCounts {
  [key: string]: number;
}

export const useStatusCounts = (applications: Application[]) => {
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({});

  useEffect(() => {
    const counts: StatusCounts = {};
    
    // Count applications by status
    applications.forEach(app => {
      const status = app.status || 'Unknown';
      counts[status] = (counts[status] || 0) + 1;
    });
    
    setStatusCounts(counts);
  }, [applications]);

  return { statusCounts };
};

export const calculateStatusCounts = (applications: Application[]): StatusCounts => {
  const counts: StatusCounts = {};
  
  applications.forEach(app => {
    const status = app.status || 'Unknown';
    counts[status] = (counts[status] || 0) + 1;
  });
  
  return counts;
};
