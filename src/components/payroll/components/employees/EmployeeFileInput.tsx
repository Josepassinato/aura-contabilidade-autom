
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EmployeeFileInputProps {
  selectedFile: File | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function EmployeeFileInput({ selectedFile, onFileSelect, disabled }: EmployeeFileInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="employee-xml-file">Arquivo XML *</Label>
      <Input
        id="employee-xml-file"
        type="file"
        accept=".xml"
        onChange={onFileSelect}
        disabled={disabled}
      />
      {selectedFile && (
        <p className="text-sm text-muted-foreground">
          Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
        </p>
      )}
    </div>
  );
}
