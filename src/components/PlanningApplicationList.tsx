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
  location: Location;
  distance?: number;
  relevanceScore?: number;
  imageUrl?: string;
}

interface PlanningApplicationListProps {
  applications: PlanningApplication[];
  isLoading?: boolean;
  error?: string | null;
  onApplicationClick?: (application: PlanningApplication) => void;
}

export const PlanningApplicationList: React.FC<PlanningApplicationListProps> = ({
  applications,
  isLoading = false,
  error = null,
  onApplicationClick
}) => {
  if (isLoading) {
    return <div className="loading">Loading applications...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (applications.length === 0) {
    return <div className="no-results">No planning applications found.</div>;
  }

  return (
    <div className="planning-application-list">
      {applications.map(application => (
        <PlanningApplicationCard
          key={application.id}
          application={application}
          onClick={onApplicationClick ? () => onApplicationClick(application) : undefined}
        />
      ))}
    </div>
  );
};
