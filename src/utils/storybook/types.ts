
/**
 * Represents a section of storybook content
 */
export interface StorySection {
  type: 'deal' | 'details' | 'nimby' | 'watchOutFor' | 'keyRegulations' | string;
  title: string;
  content: string | string[];
}

/**
 * Represents the fully processed storybook content
 */
export interface FormattedStorybook {
  header?: string | null;
  sections?: StorySection[];
  content?: string;
  rawContent?: string;
}

/**
 * Represents an emoji bullet point
 */
export interface EmojiBulletPoint {
  emoji: string;
  text: string;
}
