
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
  
  // Clean up the content - remove redundant titles
  let processedContent = content
    .replace(/^What['']s the Deal:?\s*/i, '') // Remove redundant title at start
    .replace(/What['']s the Deal:?\s*/i, '') // Also remove it if it appears later
    .replace(/<\/?strong>/g, '') // Remove literal <strong> tags
    .replace(/&lt;(\/?strong)&gt;/g, '<$1>'); // Convert encoded HTML tags
  
  // Remove any "Key Details:" section that might be mixed in
  processedContent = processedContent.split(/Key Details:?/i)[0];
  
  // Remove any "What to Watch Out For:" section that might be mixed in
  processedContent = processedContent.split(/What to Watch Out For:?/i)[0];
  
  // Extract bullet points if they exist
  const bulletRegex = /(?:^|\n)\s*([•\*\-✓🔍🏠🏢])\s+(.*?)(?=(?:^|\n)\s*[•\*\-✓🔍🏠🏢]|$)/gs;
  const bulletMatches = [...processedContent.matchAll(bulletRegex)];
  
  let formattedContent;
  
  if (bulletMatches.length > 0) {
    // Process bullet points
    formattedContent = `<ul class="list-disc pl-5 space-y-2 mt-2">`;
    bulletMatches.forEach(match => {
      const bulletPoint = match[2].trim();
      if (bulletPoint) {
        formattedContent += `<li class="pl-1 mb-2 text-left">${bulletPoint}</li>`;
      }
    });
    formattedContent += `</ul>`;
    
    // Get the content before any bullet points
    const mainContent = processedContent.split(bulletMatches[0][0])[0].trim();
    if (mainContent) {
      formattedContent = `<p class="mt-2 text-left">${mainContent}</p>${formattedContent}`;
    }
  } else {
    // If no bullet points, just render as paragraphs
    formattedContent = processedContent
      .split(/\n\n+/)
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => `<p class="mt-2 text-left">${paragraph}</p>`)
      .join('');
  }
  
  return (
    <div className="prose prose-sm max-w-none">
      <div className="bg-primary/5 rounded-lg p-4">
        <h3 className="text-primary font-semibold mb-3 text-base md:text-lg text-left">What's the Deal</h3>
        <div 
          className="text-gray-700 text-left"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
      </div>
    </div>
  );
};
