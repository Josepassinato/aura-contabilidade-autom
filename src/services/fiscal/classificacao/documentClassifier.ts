
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Classifies a document using the document-classifier edge function
 * @param documentId ID of the document to classify
 * @param filePath Path to the document file in Supabase Storage
 * @returns Promise with the classification result
 */
export async function classifyDocument(documentId: string, filePath?: string): Promise<void> {
  try {
    // Get document content from storage if filePath is provided
    let content = "";
    
    if (filePath) {
      // For PDFs and other documents, in a real implementation we would need to extract text
      // Here we're simulating text content based on the file path
      content = `Documento ${documentId} em ${filePath}. 
        Este é um exemplo de conteúdo extraído para classificação.
        Baseado no nome do arquivo, parece ser um documento de ${
          filePath.includes('fiscal') ? 'Tributária' :
          filePath.includes('recibo') ? 'Despesa' :
          filePath.includes('contrato') ? 'Investimento' :
          filePath.includes('folha') ? 'Folha de Pagamento' : 'Outros'
        }.`;
    } else {
      // Fallback if no file path is provided
      content = `Documento ${documentId} sem caminho de arquivo. Conteúdo não disponível para processamento.`;
    }

    // Call the Supabase Edge Function
    console.log(`Classificando documento ${documentId}`);
    const { data, error } = await supabase.functions.invoke("document-classifier", {
      body: { documentId, content },
    });

    if (error) {
      console.error("Erro na classificação do documento:", error);
      throw error;
    }

    console.log("Resultado da classificação:", data);
    return data;
  } catch (error) {
    console.error("Falha ao classificar documento:", error);
    throw error;
  }
}

/**
 * Batch process multiple documents
 * @param clientId Client ID to process documents for
 * @returns Number of processed documents
 */
export async function batchProcessDocuments(clientId: string): Promise<number> {
  try {
    // Fetch pending documents for this client
    const { data: documents, error } = await supabase
      .from("client_documents")
      .select("id, file_path")
      .eq("client_id", clientId)
      .eq("status", "pendente");

    if (error) {
      console.error("Erro ao buscar documentos pendentes:", error);
      throw error;
    }

    if (!documents || documents.length === 0) {
      return 0;
    }

    // Process each document
    const results = await Promise.allSettled(
      documents.map(doc => classifyDocument(doc.id, doc.file_path))
    );

    // Count successful classifications
    const successCount = results.filter(r => r.status === "fulfilled").length;
    
    return successCount;
  } catch (error) {
    console.error("Erro no processamento em lote:", error);
    throw error;
  }
}
