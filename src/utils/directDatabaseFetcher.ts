import { Application } from "@/types/planning";
import { transformApplicationData } from "./applicationTransforms";
import { handleError } from './errors/centralized-handler';

export async function fetchApplicationsDirect(searchParams: URLSearchParams): Promise<Application[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/applications?${searchParams.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const rawApplications = await response.json();

    // Transform the applications using the existing transformation function
    const transformedApplications = rawApplications.map((app: any) => {
      try {
        // Assuming transformApplicationData can handle the raw app data
        return transformApplicationData(app, [parseFloat(searchParams.get('lat') || '0'), parseFloat(searchParams.get('lng') || '0')]);
      } catch (transformError) {
        console.error("Error transforming application:", app, transformError);
        return null; // or handle the error as needed
      }
    }).filter((app: Application | null): app is Application => app !== null); // Filter out any nulls

    return transformedApplications;
  } catch (error) {
    handleError(error, { 
      context: { 
        operation: 'database_fetch',
        parameters: searchParams 
      }
    });
    throw error;
  }
}
