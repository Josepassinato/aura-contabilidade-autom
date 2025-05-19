
import { supabase } from "@/integrations/supabase/client";
import { getFileUrl } from "@/services/supabase/storageService";
import { toast } from "@/hooks/use-toast";
import { Lancamento, classificarLancamento } from "./classificacaoML";

/**
 * Interface for document classification result
 */
export interface DocumentClassificationResult {
  documentId: string;
  classification: string;
  confidence: number;
  extractedData: any;
  status: 'success' | 'failed' | 'pending';
  error?: string;
}

/**
 * Classifies a document and extracts relevant data
 * @param documentId ID of the document to classify
 * @param filePath Path to the document file
 * @returns Classification result
 */
export async function classifyDocument(documentId: string, filePath: string): Promise<DocumentClassificationResult> {
  console.log(`Classificando documento ${documentId} (${filePath})`);
  
  try {
    // In a production environment, this would analyze the document content using ML/AI services
    // For this implementation, we'll simulate document analysis based on document type
    
    // Get document details from DB
    const { data: document, error } = await supabase
      .from('client_documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (error || !document) {
      throw new Error(`Documento não encontrado: ${error?.message}`);
    }
    
    // Get signed URL to access the document content
    const fileUrl = await getFileUrl(filePath, 3600); // 1 hour expiration
    
    if (!fileUrl) {
      throw new Error('Não foi possível acessar o arquivo do documento');
    }
    
    // Process based on document type
    let extractedData = {};
    let classification = '';
    let confidence = 0;
    
    // Simulate document processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (document.type) {
      case 'nota-fiscal':
        // Simulate extracting invoice data
        extractedData = simulateInvoiceDataExtraction(document.name);
        classification = 'invoice';
        confidence = 0.92;
        
        // Register a new transaction based on the invoice
        if (extractedData) {
          await createLancamentoFromInvoice(document.client_id, extractedData);
        }
        break;
        
      case 'recibo':
        extractedData = simulateReceiptDataExtraction(document.name);
        classification = 'receipt';
        confidence = 0.88;
        break;
        
      case 'contrato':
        extractedData = { type: 'contract' };
        classification = 'contract';
        confidence = 0.95;
        break;
        
      case 'extrato':
        extractedData = { type: 'bank_statement' };
        classification = 'bank_statement';
        confidence = 0.90;
        break;
        
      default:
        extractedData = { type: 'unknown' };
        classification = 'document';
        confidence = 0.60;
    }
    
    // Update document status in database
    await supabase
      .from('client_documents')
      .update({
        status: 'processado',
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);
    
    // Return classification result
    const result: DocumentClassificationResult = {
      documentId,
      classification,
      confidence,
      extractedData,
      status: 'success'
    };
    
    return result;
    
  } catch (error) {
    console.error('Erro ao classificar documento:', error);
    
    // Update document status to indicate error
    await supabase
      .from('client_documents')
      .update({
        status: 'rejeitado',
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);
      
    // Show toast notification about the error
    toast({
      title: 'Erro ao processar documento',
      description: error instanceof Error ? error.message : 'Ocorreu um erro ao processar o documento',
      variant: 'destructive'
    });
    
    return {
      documentId,
      classification: '',
      confidence: 0,
      extractedData: {},
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Simulates extraction of data from an invoice
 */
function simulateInvoiceDataExtraction(fileName: string): any {
  // In a real implementation, this would use OCR and ML to extract data
  const now = new Date();
  const randomAmount = Math.floor(Math.random() * 10000) / 100;
  
  return {
    invoiceNumber: `NF-${Math.floor(Math.random() * 100000)}`,
    issueDate: now.toISOString().split('T')[0],
    dueDate: new Date(now.setDate(now.getDate() + 30)).toISOString().split('T')[0],
    amount: randomAmount,
    tax: Math.floor(randomAmount * 0.18 * 100) / 100, // 18% tax
    supplier: 'Fornecedor ' + fileName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5),
    items: [
      {
        description: 'Produto/Serviço',
        quantity: 1,
        unitPrice: randomAmount,
        totalPrice: randomAmount
      }
    ]
  };
}

/**
 * Simulates extraction of data from a receipt
 */
function simulateReceiptDataExtraction(fileName: string): any {
  const randomAmount = Math.floor(Math.random() * 5000) / 100;
  
  return {
    receiptNumber: `REC-${Math.floor(Math.random() * 100000)}`,
    date: new Date().toISOString().split('T')[0],
    amount: randomAmount,
    paymentMethod: ['Cartão', 'Dinheiro', 'Transferência', 'PIX'][Math.floor(Math.random() * 4)],
    description: 'Pagamento referente a ' + fileName.replace(/[^a-zA-Z0-9]/g, ' ')
  };
}

/**
 * Creates a financial transaction from an invoice
 */
async function createLancamentoFromInvoice(clientId: string, invoiceData: any): Promise<void> {
  try {
    // Create a transaction entry based on the invoice
    const lancamento: Partial<Lancamento> = {
      data: invoiceData.issueDate,
      valor: invoiceData.amount,
      descricao: `Nota Fiscal ${invoiceData.invoiceNumber} - ${invoiceData.supplier}`,
      tipo: 'despesa', // Assuming it's an expense
      status: 'pendente'
    };
    
    // Use the ML classification service to classify the transaction
    const lancamentoClassificado = classificarLancamento(lancamento as Lancamento);
    
    console.log(`Lançamento criado e classificado como ${lancamentoClassificado.categoria} com confiança ${lancamentoClassificado.confianca}`);
    
    // In a real application, this would save the transaction to a database
    // For this example, we're just logging it
    
  } catch (error) {
    console.error('Erro ao criar lançamento a partir da nota fiscal:', error);
  }
}

/**
 * Batch process multiple documents
 */
export async function batchProcessDocuments(clientId: string, status: string = 'pendente'): Promise<number> {
  try {
    // Get all pending documents for the client
    const { data: documents, error } = await supabase
      .from('client_documents')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', status);
      
    if (error) {
      throw error;
    }
    
    if (!documents || documents.length === 0) {
      return 0;
    }
    
    // Process each document
    const processPromises = documents.map(doc => 
      classifyDocument(doc.id, doc.file_path)
    );
    
    // Wait for all documents to be processed
    const results = await Promise.all(
      processPromises.map(p => p.catch(e => ({ status: 'failed', error: e })))
    );
    
    // Count successful classifications
    const successCount = results.filter(r => r.status === 'success').length;
    
    return successCount;
    
  } catch (error) {
    console.error('Erro no processamento em lote de documentos:', error);
    return 0;
  }
}
