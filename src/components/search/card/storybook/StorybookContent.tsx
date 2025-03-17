
import { FC } from "react";
import { DealSection } from "./DealSection";
import { DetailsSection } from "./DetailsSection";
import { NimbySection } from "./NimbySection";
import { WatchOutForSection } from "./WatchOutForSection";
import { KeyRegulationsSection } from "./KeyRegulationsSection";
import { FallbackContent } from "./FallbackContent";

export interface FormattedStorybook {
  header?: string | null;
  sections?: Array<{
    type: string;
    title: string;
    content: string | string[];
  }> | null;
  content?: string | null;
  rawContent?: string | null;
}

interface StorybookContentProps {
  formattedStorybook: FormattedStorybook | null;
  rawStorybook: string | null;
}

export const StorybookContent: FC<StorybookContentProps> = ({ 
  formattedStorybook, 
  rawStorybook 
}) => {
  if (!formattedStorybook && !rawStorybook) return null;
  
  // If we have formatted sections, display them
  if (formattedStorybook?.sections?.length) {
    const dealSection = formattedStorybook.sections.find(s => s.type === 'deal');
    const detailsSection = formattedStorybook.sections.find(s => s.type === 'details');
    const nimbySection = formattedStorybook.sections.find(s => s.type === 'nimby');
    const watchOutForSection = formattedStorybook.sections.find(s => s.type === 'watchOutFor');
    const keyRegulationsSection = formattedStorybook.sections.find(s => s.type === 'keyRegulations');
    
    // Check if we have actual content for details section
    const hasDetailsContent = detailsSection && (
      Array.isArray(detailsSection.content) 
        ? detailsSection.content.some(item => item && item.trim().length > 0)
        : detailsSection.content && detailsSection.content.trim().length > 0
    );
    
    return (
      <div className="space-y-6">
        {dealSection && <DealSection content={dealSection.content as string} />}
        {hasDetailsContent && <DetailsSection content={detailsSection.content} />}
        {watchOutForSection && <WatchOutForSection content={watchOutForSection.content} />}
        {keyRegulationsSection && <KeyRegulationsSection content={keyRegulationsSection.content} />}
        {nimbySection && <NimbySection content={nimbySection.content} />}
      </div>
    );
  }
  
  // Fallback to content or raw storybook
  return (
    <FallbackContent 
      content={formattedStorybook?.content} 
      storybook={rawStorybook} 
    />
  );
};
