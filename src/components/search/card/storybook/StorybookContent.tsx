
import { FC, useEffect } from "react";
import { DealSection } from "./DealSection";
import { DetailsSection } from "./DetailsSection";
import { NimbySection } from "./NimbySection";
import { WatchOutForSection } from "./WatchOutForSection";
import { KeyRegulationsSection } from "./KeyRegulationsSection";
import { FallbackContent } from "./FallbackContent";
import { FormattedStorybook } from "@/utils/storybook/types";
import { logStorybook } from "@/utils/storybook/logger";

interface StorybookContentProps {
  formattedStorybook: FormattedStorybook | null;
  rawStorybook: string | null;
  applicationId?: number;
}

export const StorybookContent: FC<StorybookContentProps> = ({ 
  formattedStorybook, 
  rawStorybook,
  applicationId
}) => {
  if (!formattedStorybook && !rawStorybook) return null;
  
  useEffect(() => {
    logStorybook.output(formattedStorybook, applicationId);
  }, [formattedStorybook, applicationId]);
  
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
        {dealSection && dealSection.content && (
          <DealSection 
            content={dealSection.content as string}
            applicationId={applicationId}
          />
        )}
        
        {hasDetailsContent && (
          <DetailsSection 
            content={detailsSection.content}
            applicationId={applicationId}
          />
        )}
        
        {watchOutForSection && watchOutForSection.content && (
          <WatchOutForSection 
            content={watchOutForSection.content}
            applicationId={applicationId}
          />
        )}
        
        {keyRegulationsSection && keyRegulationsSection.content && (
          <KeyRegulationsSection 
            content={keyRegulationsSection.content}
            applicationId={applicationId}
          />
        )}
        
        {nimbySection && nimbySection.content && (
          <NimbySection 
            content={nimbySection.content}
            applicationId={applicationId}
          />
        )}
      </div>
    );
  }
  
  // Fallback to content or raw storybook
  return (
    <FallbackContent 
      content={formattedStorybook?.content} 
      storybook={rawStorybook}
      applicationId={applicationId}
    />
  );
};
