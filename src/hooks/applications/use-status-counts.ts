
import { Application } from "@/types/planning";
import { useMemo } from "react";

export const useStatusCounts = (applications: Application[] = []) => {
  return useMemo(() => ({
    'Under Review': applications?.filter(app => 
      app.status?.toLowerCase().includes('under consideration'))?.length || 0,
    'Approved': applications?.filter(app => 
      app.status?.toLowerCase().includes('approved'))?.length || 0,
    'Declined': applications?.filter(app => 
      app.status?.toLowerCase().includes('declined'))?.length || 0,
    'Other': applications?.filter(app => {
      if (!app.status) return true;
      const appStatus = app.status.toLowerCase();
      return !appStatus.includes('under consideration') && 
             !appStatus.includes('approved') && 
             !appStatus.includes('declined');
    })?.length || 0
  }), [applications]);
};
