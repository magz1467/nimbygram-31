
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ApplicationsDashboardMap from "@/components/applications/dashboard/ApplicationsDashboardMap";

const ApplicationsDashboardMapPage = () => {
  return (
    <ErrorBoundary>
      <ApplicationsDashboardMap />
    </ErrorBoundary>
  );
};

export default ApplicationsDashboardMapPage;
