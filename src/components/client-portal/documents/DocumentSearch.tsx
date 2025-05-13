
import React from "react";
import { Search } from "lucide-react";

interface DocumentSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const DocumentSearch: React.FC<DocumentSearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Buscar documentos..."
        className="pl-8 h-9 w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};
