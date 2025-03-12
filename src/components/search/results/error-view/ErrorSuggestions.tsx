
interface ErrorSuggestionsProps {
  suggestions: string[];
}

export const ErrorSuggestions = ({ suggestions }: ErrorSuggestionsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 max-w-md w-full">
      <h3 className="font-semibold text-lg mb-2">Suggestions:</h3>
      <ul className="list-disc pl-5 space-y-1">
        {suggestions.map((suggestion, index) => (
          <li key={index} className="text-gray-700">{suggestion}</li>
        ))}
      </ul>
    </div>
  );
};
