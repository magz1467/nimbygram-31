
export interface StorySection {
  type: string;
  title: string;
  content: string | string[];
}

export interface FormattedStorybook {
  header?: string | null;
  sections?: StorySection[] | null;
  content?: string | null;
  rawContent?: string | null;
}
