
import { FormattedStorybook } from "@/utils/storybook/types";
import { DealSection } from "./storybook/DealSection";
import { DetailsSection } from "./storybook/DetailsSection";
import { WatchOutForSection } from "./storybook/WatchOutForSection";
import { KeyRegulationsSection } from "./storybook/KeyRegulationsSection";
import { NimbySection } from "./storybook/NimbySection";
import { FallbackContent } from "./storybook/FallbackContent";

interface StorybookContentProps {
  formattedStorybook: FormattedStorybook | null;
  storybook: string | null | undefined;
  shortStory?: string | null | undefined; // Add shortStory prop
  description: string | undefined;
}

export const StorybookContent = ({ 
  formattedStorybook, 
  storybook, 
  shortStory,
  description 
}: StorybookContentProps) => {
  if (formattedStorybook?.sections) {
    return (
      <div className="text-sm text-gray-600 mb-3">
        {formattedStorybook.sections.find(s => s.type === 'deal') && (
          <DealSection 
            content={formattedStorybook.sections.find(s => s.type === 'deal')?.content as string} 
          />
        )}
        
        {formattedStorybook.sections.find(s => s.type === 'details') && (
          <DetailsSection 
            content={formattedStorybook.sections.find(s => s.type === 'details')?.content} 
          />
        )}
        
        {formattedStorybook.sections.find(s => s.type === 'watchOutFor') && (
          <WatchOutForSection 
            content={formattedStorybook.sections.find(s => s.type === 'watchOutFor')?.content as string} 
          />
        )}
        
        {formattedStorybook.sections.find(s => s.type === 'keyRegulations') && (
          <KeyRegulationsSection 
            content={formattedStorybook.sections.find(s => s.type === 'keyRegulations')?.content as string} 
          />
        )}
        
        {formattedStorybook.sections.find(s => s.type === 'nimby') && (
          <NimbySection 
            content={formattedStorybook.sections.find(s => s.type === 'nimby')?.content as string} 
          />
        )}
      </div>
    );
  } else if (formattedStorybook?.content) {
    return (
      <div 
        className="text-sm text-gray-600 mb-3 prose prose-sm max-w-none text-left"
        dangerouslySetInnerHTML={{ 
          __html: formattedStorybook.content
        }}
      />
    );
  } else {
    return (
      <FallbackContent storybook={storybook || shortStory} description={description} />
    );
  }
};
