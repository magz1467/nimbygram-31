
import { formatStorybook } from "@/utils/storybook";

interface ApplicationTitleProps {
  title: string | undefined;
  storybook: string | null | undefined;
}

export const ApplicationTitle = ({ title, storybook }: ApplicationTitleProps) => {
  const formattedStorybook = storybook ? formatStorybook(storybook) : null;
  
  return (
    <div className="font-semibold text-primary mb-3 text-lg text-left">
      {formattedStorybook?.header || title || 'Planning Application'}
    </div>
  );
};
