import React from 'react';
import { Application } from "@/types/planning";
import { useApplicationSorting } from "@/hooks/use-sort-applications";
import { ApplicationListItem } from "./applications/list/ApplicationListItem";
import { EmptyState } from "./applications/list/EmptyState";
import { SortType } from "@/types/application-types";
import { PlanningApplicationCard } from './PlanningApplicationCard';

interface Location {
  lat: number;
  lng: number;
}

interface PlanningApplication {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  address: string;
  applicant?: string;
  reference?: string;
  location?: Location;
  imageUrl?: string;
}

interface PlanningApplicationListProps {
  applications: PlanningApplication[];
  onApplicationClick?: (application: PlanningApplication) => void;
}

export const PlanningApplicationList: React.FC<PlanningApplicationListProps> = ({
  applications,
  onApplicationClick
}) => {
  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-600">No applications found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {applications.map(application => (
        <PlanningApplicationCard
          key={application.id}
          application={application}
          onClick={onApplicationClick}
        />
      ))}
    </div>
  );
};

export default PlanningApplicationList;
