
import { MapPin } from "lucide-react";
import { formatStorybook } from "@/utils/storybook";
import { logStorybook } from "@/utils/storybook/logger";
import { useEffect } from "react";

interface CardHeaderProps {
  title: string;
  address: string;
  storybook?: string | null;
  applicationId?: number;
}

export const CardHeader = ({ title, address, storybook, applicationId }: CardHeaderProps) => {
  // Log storybook data for debugging
  useEffect(() => {
    logStorybook.input(storybook, applicationId);
  }, [storybook, applicationId]);
  
  const formattedStorybook = formatStorybook(storybook, applicationId);

  const cleanHeader = (header: string) => {
    let cleanedHeader = header.trim();
    cleanedHeader = cleanedHeader.replace(/^\s*\[(.*?)\]\s*$/, '$1').trim();
    cleanedHeader = cleanedHeader.replace(/[\[\]]/g, '').trim();
    return cleanedHeader;
  };

  // Use the most appropriate title from available sources
  const headerTitle = formattedStorybook?.header 
    ? cleanHeader(formattedStorybook.header)
    : title || 'Planning Application';

  return (
    <header className="px-4 py-4 text-center">
      <h2 className="font-semibold text-lg text-primary mb-2">
        {headerTitle}
      </h2>
      <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
        <MapPin className="h-4 w-4" />
        {address}
      </p>
    </header>
  );
};
