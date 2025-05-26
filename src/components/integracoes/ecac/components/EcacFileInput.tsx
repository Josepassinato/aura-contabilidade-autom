
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EcacFileInputProps {
  selectedFile: File | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function EcacFileInput({ selectedFile, onFileSelect, disabled }: EcacFileInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="xml-file">Arquivo XML *</Label>
      <Input
        id="xml-file"
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
