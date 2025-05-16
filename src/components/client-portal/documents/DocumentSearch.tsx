
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export interface DocumentSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const DocumentSearch = ({ searchTerm, onSearchChange }: DocumentSearchProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Buscar documentos..."
        className="pl-8"
        value={searchTerm}
        onChange={handleInputChange}
      />
    </div>
  );
};
