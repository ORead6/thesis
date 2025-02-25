import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative w-full sm:w-96">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search projects..."
        className="h-10 w-full rounded-lg bg-none pl-12 pr-4 text-md placeholder:text-md border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary/50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;