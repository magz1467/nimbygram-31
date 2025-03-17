
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const MobileSearchBar = () => {
  const [searchParams] = useSearchParams();
  const initialPostcode = searchParams.get('postcode') || '';
  const [postcode, setPostcode] = useState(initialPostcode);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postcode.trim()) {
      navigate(`/map?postcode=${encodeURIComponent(postcode.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="absolute top-0 left-0 right-0 z-[1000] p-4 bg-white shadow-lg">
      <div className="relative">
        <Input 
          type="text" 
          placeholder="Search new location" 
          className="w-full pl-4 pr-10 py-3 border rounded-md"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
        />
        <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
