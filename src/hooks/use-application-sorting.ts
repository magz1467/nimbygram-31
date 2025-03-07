import { Application } from "@/types/planning";
import { isWithinNextSevenDays } from "@/utils/dateUtils";
import { SortType } from "@/types/application-types";

interface SortConfig {
  type: SortType;
  applications: Application[];
}

const sortByClosingDate = (applications: Application[]) => {
  return [...applications].sort((a, b) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const dateA = a.last_date_consultation_comments ? new Date(a.last_date_consultation_comments) : null;
    const dateB = b.last_date_consultation_comments ? new Date(b.last_date_consultation_comments) : null;

    // Invalid dates go to the end
    if (!dateA || isNaN(dateA.getTime())) return 1;
    if (!dateB || isNaN(dateB.getTime())) return -1;

    const isClosingSoonA = isWithinNextSevenDays(a.last_date_consultation_comments);
    const isClosingSoonB = isWithinNextSevenDays(b.last_date_consultation_comments);

    // Prioritize "Under Review" status
    const isUnderReviewA = a.status?.toLowerCase().includes('under consideration');
    const isUnderReviewB = b.status?.toLowerCase().includes('under consideration');

    if (isUnderReviewA && !isUnderReviewB) return -1;
    if (!isUnderReviewA && isUnderReviewB) return 1;

    // Then prioritize closing soon
    if (isClosingSoonA && !isClosingSoonB) return -1;
    if (!isClosingSoonA && isClosingSoonB) return 1;

    // If both are closing soon, sort by closest date
    if (isClosingSoonA && isClosingSoonB) {
      return dateA.getTime() - dateB.getTime();
    }

    // For non-closing soon, sort by date descending
    return dateB.getTime() - dateA.getTime();
  });
};

const sortByNewest = (applications: Application[]) => {
  return [...applications].sort((a, b) => {
    const dateA = a.valid_date ? new Date(a.valid_date) : null;
    const dateB = b.valid_date ? new Date(b.valid_date) : null;

    // Invalid dates go to the end
    if (!dateA || isNaN(dateA.getTime())) return 1;
    if (!dateB || isNaN(dateB.getTime())) return -1;

    // Sort by date descending (newest first)
    return dateB.getTime() - dateA.getTime();
  });
};

export const useApplicationSorting = ({ type, applications }: SortConfig) => {
  if (!applications?.length) return [];
  
  console.log('Sorting applications with type:', type);
  console.log('Number of applications before sort:', applications.length);

  let sorted;
  switch (type) {
    case 'closingSoon':
      sorted = sortByClosingDate(applications);
      break;
    case 'newest':
      sorted = sortByNewest(applications);
      break;
    default:
      sorted = applications;
  }

  console.log('Number of applications after sort:', sorted.length);
  return sorted;
};
