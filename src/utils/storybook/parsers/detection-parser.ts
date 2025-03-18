
import { StorySection } from '../types';

/**
 * Detects sections in storybook content by looking for emoji markers and section patterns
 */
export function detectSections(content: string): StorySection[] {
  if (!content) return [];
  
  console.log('Detecting sections in content using emoji markers');
  
  const sections: StorySection[] = [];
  
  // Try to find sections based on emoji patterns
  const dealPattern = /(?:^|\n)(?:🔍|📝|📋|📄|📑|💡|🏗️)\s+(?:What['']s the Deal:?|What['']s Happening:?|Overview:?|Summary:?)/i;
  const detailsPattern = /(?:^|\n)(?:🔑|🔍|📋|📊|📝|📌)\s+(?:Key Details:?|Details:?|Specifics:?|Key Info:?)/i;
  const watchOutForPattern = /(?:^|\n)(?:⚠️|👀|🚨|⛔|🔴|❗)\s+(?:What to Watch Out For:?|Watch Out For:?|Concerns:?|Issues:?)/i;
  const nimbyPattern = /(?:^|\n)(?:🏡|🏘️|🏠|🏢|🏗️)\s+(?:Nimbywatch:?|Community Concerns:?|Local Impact:?)/i;
  const keyRegulationsPattern = /(?:^|\n)(?:📃|📜|📚|⚖️|🔏)\s+(?:Key Regulations:?|Regulations:?|Rules:?|Planning Rules:?)/i;
  
  // Deal section
  const dealMatch = content.match(dealPattern);
  if (dealMatch) {
    // Find the next section or end of content
    const startPos = dealMatch.index! + dealMatch[0].length;
    const nextSectionMatch = content.slice(startPos).match(detailsPattern) || 
                             content.slice(startPos).match(watchOutForPattern) || 
                             content.slice(startPos).match(nimbyPattern) ||
                             content.slice(startPos).match(keyRegulationsPattern);
    
    const endPos = nextSectionMatch 
      ? startPos + nextSectionMatch.index! 
      : content.length;
    
    const dealContent = content.slice(startPos, endPos).trim();
    
    if (dealContent) {
      sections.push({
        type: 'deal',
        title: "What's the Deal",
        content: dealContent
      });
    }
  }
  
  // Details section
  const detailsMatch = content.match(detailsPattern);
  if (detailsMatch) {
    // Find the next section or end of content
    const startPos = detailsMatch.index! + detailsMatch[0].length;
    const nextSectionMatch = content.slice(startPos).match(watchOutForPattern) || 
                             content.slice(startPos).match(nimbyPattern) ||
                             content.slice(startPos).match(keyRegulationsPattern);
    
    const endPos = nextSectionMatch 
      ? startPos + nextSectionMatch.index! 
      : content.length;
    
    const detailsContent = content.slice(startPos, endPos).trim();
    
    if (detailsContent) {
      // For details, check if there are bullet points with emojis
      const bulletPoints = extractFormattedBulletPoints(detailsContent);
      
      sections.push({
        type: 'details',
        title: "Key Details",
        content: bulletPoints.length > 0 ? bulletPoints : detailsContent
      });
    }
  }
  
  // Watch Out For section
  const watchOutForMatch = content.match(watchOutForPattern);
  if (watchOutForMatch) {
    // Find the next section or end of content
    const startPos = watchOutForMatch.index! + watchOutForMatch[0].length;
    const nextSectionMatch = content.slice(startPos).match(nimbyPattern) ||
                             content.slice(startPos).match(keyRegulationsPattern);
    
    const endPos = nextSectionMatch 
      ? startPos + nextSectionMatch.index! 
      : content.length;
    
    const watchOutForContent = content.slice(startPos, endPos).trim();
    
    if (watchOutForContent) {
      sections.push({
        type: 'watchOutFor',
        title: "What to Watch Out For",
        content: watchOutForContent
      });
    }
  }
  
  // Nimby section
  const nimbyMatch = content.match(nimbyPattern);
  if (nimbyMatch) {
    // Find the next section or end of content
    const startPos = nimbyMatch.index! + nimbyMatch[0].length;
    const nextSectionMatch = content.slice(startPos).match(keyRegulationsPattern);
    
    const endPos = nextSectionMatch 
      ? startPos + nextSectionMatch.index! 
      : content.length;
    
    const nimbyContent = content.slice(startPos, endPos).trim();
    
    if (nimbyContent) {
      sections.push({
        type: 'nimby',
        title: "Nimbywatch",
        content: nimbyContent
      });
    }
  }
  
  // Key Regulations section
  const keyRegulationsMatch = content.match(keyRegulationsPattern);
  if (keyRegulationsMatch) {
    const startPos = keyRegulationsMatch.index! + keyRegulationsMatch[0].length;
    const keyRegulationsContent = content.slice(startPos).trim();
    
    if (keyRegulationsContent) {
      sections.push({
        type: 'keyRegulations',
        title: "Key Regulations",
        content: keyRegulationsContent
      });
    }
  }
  
  return sections;
}

/**
 * Extract bullet points with emoji markers as an array
 */
function extractFormattedBulletPoints(content: string): string[] {
  const bulletPoints: string[] = [];
  
  // Enhanced regex for emoji bullet points and traditional markers
  const bulletPointRegex = /(?:^|\n)\s*([\u{1F300}-\u{1F6FF}\u{2600}-\u{27BF}✓]|\*|•|-)\s+(.*?)(?=(?:^|\n)\s*(?:[\u{1F300}-\u{1F6FF}\u{2600}-\u{27BF}✓]|\*|•|-)\s+|\n\n|$)/gsu;
  
  const bulletMatches = Array.from(content.matchAll(bulletPointRegex));
  
  bulletMatches.forEach(match => {
    const marker = match[1]; // The bullet marker (emoji or traditional)
    const text = match[2].trim(); // The text content
    
    // For emoji bullets, include the emoji at the start of the text
    if (/[\u{1F300}-\u{1F6FF}\u{2600}-\u{27BF}✓]/u.test(marker)) {
      bulletPoints.push(`${marker} ${text}`);
    } else {
      bulletPoints.push(text);
    }
  });
  
  return bulletPoints;
}
