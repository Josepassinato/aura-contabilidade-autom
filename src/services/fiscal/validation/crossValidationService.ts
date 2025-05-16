
import { FonteDadosConfig } from "@/components/apuracao/FontesDadosAutomaticas";
import { processarLancamentosAvancados } from "@/services/fiscal/classificacao/processamentoAvancado";
import { toast } from "@/hooks/use-toast";

export interface ValidationResult {
  source: string;
  targetSource: string;
  matchRate: number;
  discrepancies: Discrepancy[];
  status: 'success' | 'warning' | 'error';
  timestamp: string;
}

export interface Discrepancy {
  field: string;
  sourceValue: any;
  targetValue: any;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface CrossValidationConfig {
  enabledSources: string[];
  matchThreshold: number; // Percentage match required for validation success
  validateAutomatically: boolean;
  notifyOnDiscrepancy: boolean;
  storeValidationHistory: boolean;
}

// Default configuration
const defaultConfig: CrossValidationConfig = {
  enabledSources: [],
  matchThreshold: 0.9, // 90% match required
  validateAutomatically: true,
  notifyOnDiscrepancy: true,
  storeValidationHistory: true,
};

// Current configuration state
let currentConfig: CrossValidationConfig = { ...defaultConfig };

/**
 * Configure the cross-validation service
 */
export const configureCrossValidation = (config: Partial<CrossValidationConfig>): CrossValidationConfig => {
  currentConfig = { ...currentConfig, ...config };
  return currentConfig;
};

/**
 * Get the current configuration
 */
export const getCrossValidationConfig = (): CrossValidationConfig => {
  return { ...currentConfig };
};

/**
 * Perform cross-validation between multiple data sources
 * @param sources Array of configured data sources to validate
 * @returns Validation results for each source pair
 */
export const performCrossValidation = async (
  sources: FonteDadosConfig[]
): Promise<ValidationResult[]> => {
  const results: ValidationResult[] = [];
  const enabledSources = sources.filter(s => 
    currentConfig.enabledSources.includes(s.tipo)
  );

  if (enabledSources.length < 2) {
    console.warn("Cross-validation requires at least 2 enabled sources");
    return results;
  }

  console.log(`Starting cross-validation between ${enabledSources.length} sources`);

  // For each pair of sources, validate data
  for (let i = 0; i < enabledSources.length; i++) {
    for (let j = i + 1; j < enabledSources.length; j++) {
      const sourceA = enabledSources[i];
      const sourceB = enabledSources[j];
      
      try {
        console.log(`Validating ${sourceA.tipo} against ${sourceB.tipo}`);
        
        // Get data from both sources (in real implementation, would call external APIs or DB)
        const dataA = await fetchSourceData(sourceA);
        const dataB = await fetchSourceData(sourceB);
        
        // Compare data between sources
        const validationResult = compareSourceData(sourceA.tipo, sourceB.tipo, dataA, dataB);
        results.push(validationResult);
        
        // Notify on significant discrepancies
        if (currentConfig.notifyOnDiscrepancy && 
            validationResult.status === 'error' && 
            validationResult.discrepancies.length > 0) {
          notifyDiscrepancy(validationResult);
        }
      } catch (error) {
        console.error(`Error validating between ${sourceA.tipo} and ${sourceB.tipo}:`, error);
        results.push({
          source: sourceA.tipo,
          targetSource: sourceB.tipo,
          matchRate: 0,
          discrepancies: [{
            field: 'system',
            sourceValue: null,
            targetValue: null,
            severity: 'high',
            description: `Error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          status: 'error',
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Store validation history if enabled
  if (currentConfig.storeValidationHistory && results.length > 0) {
    await storeValidationHistory(results);
  }

  return results;
};

/**
 * Fetch data from a specific source
 * In a real implementation, this would connect to the actual data sources
 */
const fetchSourceData = async (source: FonteDadosConfig): Promise<any[]> => {
  // Simulated data fetch based on source type
  // In a real implementation, this would:
  // 1. Connect to the appropriate API/database using source credentials
  // 2. Fetch and format recent data
  
  // Mock implementation for demonstration
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = generateMockDataForSource(source.tipo);
      resolve(mockData);
    }, 800); // Simulate network delay
  });
};

/**
 * Generate mock data for different source types
 * This is for demonstration only and would be replaced by actual API calls
 */
const generateMockDataForSource = (sourceType: string): any[] => {
  const baseData = [
    { 
      id: '001', 
      date: '2023-05-15',
      description: 'Pagamento de fornecedor',
      value: 1250.00,
      category: 'expense',
      metadata: { supplier: 'Fornecedor A', invoice: 'NF-001' }
    },
    { 
      id: '002', 
      date: '2023-05-16',
      description: 'Recebimento de cliente',
      value: 3500.00,
      category: 'income',
      metadata: { client: 'Cliente B', invoice: 'NF-002' }
    },
    { 
      id: '003',
      date: '2023-05-17',
      description: 'Despesa operacional',
      value: 780.50,
      category: 'expense',
      metadata: { type: 'operational', department: 'admin' }
    }
  ];
  
  // Introduce some variations based on source type to simulate discrepancies
  const modifiedData = JSON.parse(JSON.stringify(baseData));
  
  switch (sourceType) {
    case 'ocr':
      // OCR might have some recognition errors
      modifiedData[0].description = 'Pagamento de fornecedo';
      modifiedData[1].value = 3500.50; // Small value difference
      break;
      
    case 'api_fiscal':
      // API Fiscal might classify things slightly differently
      modifiedData[2].category = 'operational_expense';
      break;
      
    case 'erp':
      // ERP might have more detailed or structured data
      modifiedData[0].metadata.payment_method = 'bank_transfer';
      modifiedData[2].metadata.cost_center = 'administration';
      break;
      
    case 'openbanking':
      // Banking data might have different descriptions
      modifiedData[0].description = 'TED Fornecedor A';
      modifiedData[1].description = 'DEP Cliente B';
      break;
  }
  
  return modifiedData;
};

/**
 * Compare data between two sources and generate validation results
 */
const compareSourceData = (
  sourceAType: string,
  sourceBType: string,
  dataA: any[],
  dataB: any[]
): ValidationResult => {
  const discrepancies: Discrepancy[] = [];
  let matchedItems = 0;
  let totalComparisons = 0;
  
  // Simple matching algorithm - would be more sophisticated in real implementation
  // with fuzzy matching for descriptions, date normalization, etc.
  dataA.forEach(itemA => {
    // Find a potential match in source B
    const matchB = dataB.find(itemB => {
      // Match by id, or combination of date+value if id not reliable
      return itemB.id === itemA.id || 
             (itemB.date === itemA.date && Math.abs(itemB.value - itemA.value) < 0.01);
    });
    
    if (matchB) {
      // Item matched between sources, check for discrepancies in fields
      totalComparisons++;
      let itemMatches = true;
      
      // Check description (allow fuzzy match)
      if (!stringSimilarity(itemA.description, matchB.description, 0.8)) {
        discrepancies.push({
          field: 'description',
          sourceValue: itemA.description,
          targetValue: matchB.description,
          severity: 'low',
          description: 'Description text differs significantly between sources'
        });
        itemMatches = false;
      }
      
      // Check value (with small tolerance)
      if (Math.abs(itemA.value - matchB.value) > 0.5) {
        discrepancies.push({
          field: 'value',
          sourceValue: itemA.value,
          targetValue: matchB.value,
          severity: 'high',
          description: `Value discrepancy of ${Math.abs(itemA.value - matchB.value).toFixed(2)}`
        });
        itemMatches = false;
      }
      
      // Check category (expecting possible differences in classification)
      if (itemA.category !== matchB.category) {
        discrepancies.push({
          field: 'category',
          sourceValue: itemA.category,
          targetValue: matchB.category,
          severity: 'medium',
          description: 'Category classification differs between sources'
        });
        itemMatches = false;
      }
      
      if (itemMatches) {
        matchedItems++;
      }
    } else {
      // No match found in source B
      discrepancies.push({
        field: 'record',
        sourceValue: `${itemA.date}: ${itemA.description} (${itemA.value})`,
        targetValue: 'No matching record',
        severity: 'high',
        description: 'Record exists in one source but not in the other'
      });
      totalComparisons++;
    }
  });
  
  // Check for records in B that aren't in A
  dataB.forEach(itemB => {
    const hasMatchInA = dataA.some(itemA => 
      itemA.id === itemB.id || 
      (itemA.date === itemB.date && Math.abs(itemA.value - itemB.value) < 0.01)
    );
    
    if (!hasMatchInA) {
      discrepancies.push({
        field: 'record',
        sourceValue: 'No matching record',
        targetValue: `${itemB.date}: ${itemB.description} (${itemB.value})`,
        severity: 'high',
        description: 'Record exists in one source but not in the other'
      });
      totalComparisons++;
    }
  });
  
  // Calculate match rate
  const matchRate = totalComparisons > 0 ? matchedItems / totalComparisons : 0;
  
  // Determine status based on match rate and threshold
  let status: 'success' | 'warning' | 'error';
  if (matchRate >= currentConfig.matchThreshold) {
    status = 'success';
  } else if (matchRate >= currentConfig.matchThreshold * 0.7) {
    status = 'warning'; // Within 70% of threshold
  } else {
    status = 'error';
  }
  
  return {
    source: sourceAType,
    targetSource: sourceBType,
    matchRate,
    discrepancies,
    status,
    timestamp: new Date().toISOString()
  };
};

/**
 * Utility function to check string similarity
 * Real implementation would use a proper algorithm like Levenshtein distance
 */
const stringSimilarity = (str1: string, str2: string, threshold: number): boolean => {
  // Simple implementation for demonstration
  // For proper implementation, use a library or implement edit distance
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return true;
  
  // Convert to lowercase for comparison
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Count matching characters (rough approximation)
  let matches = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) matches++;
  }
  
  return matches / maxLength >= threshold;
};

/**
 * Notify about significant discrepancies
 */
const notifyDiscrepancy = (result: ValidationResult) => {
  // Count high severity discrepancies
  const highSeverityCount = result.discrepancies.filter(d => d.severity === 'high').length;
  
  if (highSeverityCount > 0) {
    toast({
      title: "Discrepâncias críticas detectadas",
      description: `${highSeverityCount} discrepâncias graves entre ${result.source} e ${result.targetSource}`,
      variant: "destructive"
    });
  } else if (result.discrepancies.length > 0) {
    toast({
      title: "Discrepâncias detectadas",
      description: `${result.discrepancies.length} discrepâncias entre ${result.source} e ${result.targetSource}`,
      variant: "default"
    });
  }
};

/**
 * Store validation history
 * In a real implementation, this would save to a database
 */
const storeValidationHistory = async (results: ValidationResult[]): Promise<void> => {
  console.log("Storing validation history:", results);
  // In a real implementation, this would persist to a database
  localStorage.setItem('cross_validation_history', JSON.stringify({
    timestamp: new Date().toISOString(),
    results
  }));
};
