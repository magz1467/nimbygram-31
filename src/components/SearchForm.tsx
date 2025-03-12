
import { SearchBar } from "@/components/search/SearchBar";

interface SearchFormProps {
  activeTab: string;
  onSearch: (term: string) => void;
}

export const SearchForm = ({ activeTab, onSearch }: SearchFormProps) => {
  return <SearchBar onSearch={onSearch} />;
};
