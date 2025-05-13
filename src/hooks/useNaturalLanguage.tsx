
import { useNLPProcessor } from './nlp/useNLPProcessor';
export { type NLPIntent, type NLPResult } from './nlp/types';

export function useNaturalLanguage() {
  // Simply re-export the functionality from the refactored hook
  return useNLPProcessor();
}
