
/**
 * Funções utilitárias para validação de dados
 */

/**
 * Valida um CNPJ
 * @param value CNPJ a ser validado (com ou sem formatação)
 * @returns boolean indicando se o CNPJ é válido
 */
export const validateCNPJ = (value: string): boolean => {
  // Remove caracteres não numéricos
  const numbers = value.replace(/\D/g, "");
  
  // Verifica se tem 14 dígitos
  if (numbers.length !== 14) {
    return false;
  }

  // Validação básica: verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) {
    return false;
  }

  // Implementação do algoritmo de validação de CNPJ
  let size = numbers.length - 2;
  let numbers_array = numbers.substring(0, size);
  const digits = numbers.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers_array.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    return false;
  }

  size = size + 1;
  numbers_array = numbers.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers_array.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return result === parseInt(digits.charAt(1));
};

/**
 * Valida um CPF
 * @param value CPF a ser validado (com ou sem formatação)
 * @returns boolean indicando se o CPF é válido
 */
export const validateCPF = (value: string): boolean => {
  // Remove caracteres não numéricos
  const numbers = value.replace(/\D/g, "");
  
  // Verifica se tem 11 dígitos
  if (numbers.length !== 11) {
    return false;
  }

  // Validação básica: verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) {
    return false;
  }

  // Validação usando algoritmo de CPF
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(numbers.substring(i-1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;

  if ((remainder === 10) || (remainder === 11)) {
    remainder = 0;
  }

  if (remainder !== parseInt(numbers.substring(9, 10))) {
    return false;
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(numbers.substring(i-1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;

  if ((remainder === 10) || (remainder === 11)) {
    remainder = 0;
  }

  return remainder === parseInt(numbers.substring(10, 11));
};
