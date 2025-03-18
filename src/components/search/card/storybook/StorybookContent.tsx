import { FC, useEffect } from "react";
import { DealSection } from "./DealSection";
import { DetailsSection } from "./DetailsSection";
import { NimbySection } from "./NimbySection";
import { WatchOutForSection } from "./WatchOutForSection";
import { KeyRegulationsSection } from "./KeyRegulationsSection";
import { FallbackContent } from "./FallbackContent";
import { FormattedStorybook } from "@/utils/storybook/types";

interface StorybookContentProps {
  formattedStorybook: FormattedStorybook | null;
  rawStorybook: string | null;
}

export const StorybookContent: FC<StorybookContentProps> = ({ 
  formattedStorybook, 
  rawStorybook 
}) => {
  if (!formattedStorybook && !rawStorybook) return null;
  
  useEffect(() => {
    if (formattedStorybook?.sections?.length) {
      console.log('info: StorybookContent rendering with sections:', 
        formattedStorybook.sections.map(s => s.type)
      );
    }
  }, [formattedStorybook]);
  
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
        {dealSection && dealSection.content && <DealSection content={dealSection.content as string} />}
        {hasDetailsContent && <DetailsSection content={detailsSection.content} />}
        {watchOutForSection && watchOutForSection.content && <WatchOutForSection content={watchOutForSection.content} />}
        {keyRegulationsSection && keyRegulationsSection.content && <KeyRegulationsSection content={keyRegulationsSection.content} />}
        {nimbySection && nimbySection.content && <NimbySection content={nimbySection.content} />}
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
