
import React from "react";
import { FileText } from "lucide-react";

interface FileUploaderProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, uploading }) => {
  return (
    <div className="col-span-4">
      <label className="block text-sm font-medium mb-2">
        Selecionar Arquivos
      </label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
        <input
          type="file"
          id="file-upload"
          multiple
          className="hidden"
          onChange={onFileSelect}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
          disabled={uploading}
        />
        <label 
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center justify-center"
        >
          <FileText className="h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Clique para selecionar ou arraste arquivos
          </p>
          <p className="text-xs text-gray-500">
            PDF, JPG, PNG, DOC, XLS (max. 10MB)
          </p>
        </label>
      </div>
    </div>
  );
};
