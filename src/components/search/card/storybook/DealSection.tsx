
import { FC } from "react";

interface DealSectionProps {
  content: string;
}

export const DealSection: FC<DealSectionProps> = ({ content }) => {
  if (!content) return null;
  
  // More robust empty content check
  const isEmptyContent = (str: string) => {
    // Remove whitespace, bullet characters, and dashes
    const trimmed = str.replace(/[\s•\-*]/g, '');
    return trimmed.length === 0;
  };
  
  // Return null if content is effectively empty
  if (isEmptyContent(content)) return null;
  
  // Clean up the content - remove redundant titles and formatting markers
  let processedContent = content
    .replace(/^What['']s the Deal:?\s*/i, '') // Remove redundant title at start
    .replace(/What['']s the Deal:?\s*/i, '') // Also remove it if it appears later
    .replace(/<\/?strong>/g, '') // Remove literal <strong> tags
    .replace(/&lt;(\/?strong)&gt;/g, '<$1>') // Convert encoded HTML tags
    .replace(/\*\*/g, '') // Remove any ** markers completely
    .replace(/^\s*[\*•-]\s*$/gm, '') // Remove empty bullet points
    .replace(/\n\s*[\*•-]\s*\n/g, '\n'); // Remove empty bullet points with newlines
  
  // Remove any "Key Details:" section that might be mixed in
  processedContent = processedContent.split(/Key Details:?/i)[0];
  
  // Remove any "What to Watch Out For:" section that might be mixed in
  processedContent = processedContent.split(/What to Watch Out For:?/i)[0];
  
  // Process formatted content to handle emoji bullet points
  const { formattedContent, hasBulletPoints } = processFormattedContent(processedContent);
  
  return (
    <div className="prose prose-sm max-w-none">
      <div className="bg-primary/5 rounded-lg p-4">
        <h3 className="text-primary font-semibold mb-3 text-base md:text-lg text-left">What's the Deal</h3>
        
        {hasBulletPoints ? (
          <div 
            className="text-gray-700"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        ) : (
          <p className="text-gray-700 mb-0 text-left">{formattedContent}</p>
        )}
      </div>
    </div>
  );
};

// Process content to handle emoji bullet points and format properly
function processFormattedContent(content: string): { formattedContent: string, hasBulletPoints: boolean } {
  // Check if content contains emoji bullet points or traditional bullet points
  const bulletPointRegex = /(?:^|\n)\s*([\u{1F300}-\u{1F6FF}\u{2600}-\u{27BF}✓]|\*|•|-)\s+(.*?)(?=(?:^|\n)\s*(?:[\u{1F300}-\u{1F6FF}\u{2600}-\u{27BF}✓]|\*|•|-)\s+|\n\n|$)/gsu;
  
  const bulletMatches = Array.from(content.matchAll(bulletPointRegex));
  
  if (bulletMatches.length > 0) {
    // We have bullet points, process them specially
    const sections: string[] = [];
    const bulletPoints: string[] = [];
    
    // Check if there's text before the first bullet point
    const firstBulletStart = bulletMatches[0].index!;
    if (firstBulletStart > 0) {
      const beforeBullets = content.substring(0, firstBulletStart).trim();
      if (beforeBullets) {
        sections.push(`<p class="mb-3 text-left">${beforeBullets}</p>`);
      }
    }
    
    // Process each bullet point
    bulletMatches.forEach(match => {
      const marker = match[1]; // The bullet marker (emoji or traditional)
      const text = match[2].trim(); // The text content
      
      // Handle emoji bullet points specially
      if (/[\u{1F300}-\u{1F6FF}\u{2600}-\u{27BF}✓]/u.test(marker)) {
        bulletPoints.push(`<li class="pl-0 mb-2 flex items-start text-left">
          <span class="inline-block mr-2 flex-shrink-0">${marker}</span>
          <span class="flex-1">${text}</span>
        </li>`);
      } else {
        bulletPoints.push(`<li class="pl-0 mb-2 text-left">${text}</li>`);
      }
    });
    
    // Add the formatted bullet points list
    if (bulletPoints.length > 0) {
      sections.push(`<ul class="list-disc pl-5 space-y-2 mb-0">${bulletPoints.join('')}</ul>`);
    }
    
    // Text after the last bullet point
    const lastBulletMatch = bulletMatches[bulletMatches.length - 1];
    const lastMatchEndPos = lastBulletMatch.index! + lastBulletMatch[0].length;
    if (lastMatchEndPos < content.length) {
      const afterBullets = content.substring(lastMatchEndPos).trim();
      if (afterBullets) {
        sections.push(`<p class="mt-3 mb-0 text-left">${afterBullets}</p>`);
      }
    }
    
    return {
      formattedContent: sections.join(''),
      hasBulletPoints: true
    };
  }
  
  // No bullet points found, return original content
  return {
    formattedContent: content,
    hasBulletPoints: false
  };
}
