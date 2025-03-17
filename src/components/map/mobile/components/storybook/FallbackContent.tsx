
interface FallbackContentProps {
  storybook: string | null | undefined;
  description: string | undefined;
}

export const FallbackContent = ({ storybook, description }: FallbackContentProps) => {
  if (storybook) {
    return (
      <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap line-clamp-4 text-left">
        {storybook}
      </p>
    );
  } else {
    return (
      <p className="text-sm text-gray-600 mb-3 line-clamp-3 text-left">
        {description || "No description available"}
      </p>
    );
  }
};
