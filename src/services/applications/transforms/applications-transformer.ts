
import { Application } from "@/types/planning";
import { transformApplicationData } from '@/utils/transformApplicationData';

/**
 * Transforms raw application data from API to typed Application objects
 */
export function transformApplicationsData(rawApplications: any[]): Application[] {
  if (!rawApplications || !Array.isArray(rawApplications)) {
    console.warn('Received invalid applications data:', rawApplications);
    return [];
  }

  return rawApplications
    .map(app => transformApplicationData(app))
    .filter((app): app is Application => app !== null);
}

/**
 * Transforms a single application with additional metadata
 */
export function transformSingleApplication(application: any): Application | null {
  return transformApplicationData(application);
}
