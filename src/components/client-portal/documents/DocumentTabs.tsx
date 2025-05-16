
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Receipt, FileArchive, FileCheck } from "lucide-react";
import { Document } from "@/lib/supabase";

export interface DocumentTabsProps {
  documents: Document[];
  onViewDocument: (document: Document) => Promise<void>;
}

export const DocumentTabs = ({ documents, onViewDocument }: DocumentTabsProps) => {
  return (
    <Tabs defaultValue="todos" className="w-full">
      <TabsList className="grid grid-cols-4 md:w-fit">
        <TabsTrigger value="todos" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Todos</span>
        </TabsTrigger>
        <TabsTrigger value="notas" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          <span className="hidden sm:inline">Notas Fiscais</span>
        </TabsTrigger>
        <TabsTrigger value="contratos" className="flex items-center gap-2">
          <FileArchive className="h-4 w-4" />
          <span className="hidden sm:inline">Contratos</span>
        </TabsTrigger>
        <TabsTrigger value="outros" className="flex items-center gap-2">
          <FileCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Outros</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
