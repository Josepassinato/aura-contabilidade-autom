
import { toast } from '@/hooks/use-toast';
import { 
  registerTokenUsage,
  getTokenUsageStats,
  resetTokenUsage
} from '@/components/settings/openai/openAiService';

// Interface for token usage statistics with additional cost analysis
export interface TokenUsageStats {
  totalTokens: number;
  lastReset: string; // ISO date string
  requests: number;
  estimatedCost?: number;
  usageByModel?: Record<string, number>;
  usageByClient?: Record<string, number>;
}

// Token costs in USD per 1K tokens (approximate)
const TOKEN_COSTS = {
  'gpt-4o-mini': 0.00015, // $0.15 per 1K tokens
  'gpt-4o': 0.003, // $3 per 1K tokens
  'gpt-4.5-preview': 0.005, // $5 per 1K tokens
  'default': 0.003 // Default cost if model not specified
};

// Register token usage with additional metadata
export const trackTokenUsage = (
  tokenCount: number, 
  model: string = 'default',
  clientId?: string
): void => {
  try {
    // Register basic token usage
    registerTokenUsage(tokenCount);
    
    // In a real implementation, this would store the additional metadata
    // to a more sophisticated storage system or database
    console.log(`Tracked ${tokenCount} tokens for model: ${model}, client: ${clientId || 'system'}`);
    
    // Check usage limits
    checkUsageLimits();
  } catch (error) {
    console.error("Error tracking token usage:", error);
  }
};

// Get enhanced token usage statistics with cost analysis
export const getEnhancedTokenUsageStats = (): TokenUsageStats => {
  const basicStats = getTokenUsageStats();
  
  // Calculate estimated cost based on default rate
  // In a real implementation, this would use the actual model breakdown
  const estimatedCost = (basicStats.totalTokens / 1000) * TOKEN_COSTS.default;
  
  return {
    ...basicStats,
    estimatedCost: parseFloat(estimatedCost.toFixed(2))
  };
};

// Reset all token usage statistics
export const resetAllTokenUsage = (): void => {
  resetTokenUsage();
  toast({
    title: "Usage statistics reset",
    description: "All token usage statistics have been reset."
  });
};

// Check if usage is approaching limits and send alerts
export const checkUsageLimits = (): void => {
  const stats = getTokenUsageStats();
  const DEFAULT_LIMIT = 1000000; // 1 million tokens
  const WARNING_THRESHOLD = 0.8; // 80% of limit
  
  // Get user-configured limit or use default
  const configuredLimit = parseInt(localStorage.getItem('openai-token-limit') || '0');
  const limit = configuredLimit > 0 ? configuredLimit : DEFAULT_LIMIT;
  
  // Calculate usage percentage
  const usagePercentage = stats.totalTokens / limit;
  
  // Show warning if approaching limit
  if (usagePercentage >= WARNING_THRESHOLD && usagePercentage < 1) {
    toast({
      title: "Token usage warning",
      description: `You've used ${Math.round(usagePercentage * 100)}% of your token limit.`,
      variant: "warning"
    });
  } 
  // Show alert if exceeded limit
  else if (usagePercentage >= 1) {
    toast({
      title: "Token usage limit exceeded",
      description: `You've exceeded your configured token limit of ${limit.toLocaleString()}.`,
      variant: "destructive"
    });
  }
};

// Set a new token usage limit
export const setTokenUsageLimit = (limit: number): void => {
  if (limit > 0) {
    localStorage.setItem('openai-token-limit', limit.toString());
    toast({
      title: "Token limit updated",
      description: `Token usage limit set to ${limit.toLocaleString()}.`
    });
    
    // Check current usage against new limit
    checkUsageLimits();
  }
};

// Get current token usage limit
export const getTokenUsageLimit = (): number => {
  const limit = parseInt(localStorage.getItem('openai-token-limit') || '0');
  return limit > 0 ? limit : 1000000; // Return configured limit or default
};

