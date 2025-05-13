
import React from "react";
import { FileText, X } from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

interface FileListProps {
  files: FileItem[];
  onRemoveFile: (id: string) => void;
  uploading: boolean;
}

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const FileList: React.FC<FileListProps> = ({ files, onRemoveFile, uploading }) => {
  if (files.length === 0) return null;

  return (
    <div className="col-span-4">
      <h3 className="font-medium mb-2">Arquivos Selecionados:</h3>
      <div className="max-h-40 overflow-y-auto">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              <div>
                <p className="text-sm font-medium truncate max-w-[300px]">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onRemoveFile(file.id)}
              className="text-gray-500 hover:text-red-500"
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
