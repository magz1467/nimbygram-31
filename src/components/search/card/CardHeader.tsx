
import { MapPin } from "lucide-react";
import { formatStorybook } from "@/utils/storybook-formatter";

interface CardHeaderProps {
  title: string;
  address: string;
  storybook?: string | null;
}

export const CardHeader = ({ title, address, storybook }: CardHeaderProps) => {
  const formattedStorybook = formatStorybook(storybook);

  const cleanHeader = (header: string) => {
    let cleanedHeader = header.trim();
    cleanedHeader = cleanedHeader.replace(/^\s*\[(.*?)\]\s*$/, '$1').trim();
    cleanedHeader = cleanedHeader.replace(/[\[\]]/g, '').trim();
    return cleanedHeader;
  };

  return (
    <header className="px-4 py-4 text-center">
      <h2 className="font-semibold text-lg text-primary mb-2">
        {cleanHeader(formattedStorybook?.header || title || 'Planning Application')}
      </h2>
      <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
        <MapPin className="h-4 w-4" />
        {address}
      </p>
    </header>
  );
};

