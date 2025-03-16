
import { MapPin } from "lucide-react";
import { formatStorybook } from "@/utils/storybook-formatter";

interface CardHeaderProps {
  title: string;
  address: string;
  storybook?: string | null;
}

export const CardHeader = ({ title, address, storybook }: CardHeaderProps) => {
  // Log incoming storybook data for debugging
  console.log('CardHeader received storybook:', storybook ? 'yes' : 'no', 
    storybook ? `length: ${storybook.length}` : '');
  
  const formattedStorybook = formatStorybook(storybook);

  // Log the storybook content for debugging
  console.log('CardHeader storybook formatted result:', 
    formattedStorybook ? 'success' : 'null', 
    formattedStorybook?.header ? `header: ${formattedStorybook.header}` : 'no header');

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
