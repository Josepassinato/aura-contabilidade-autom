
/**
 * Formata um CNPJ adicionando pontuação
 * @param value String contendo apenas números do CNPJ
 * @returns CNPJ formatado (XX.XXX.XXX/XXXX-XX)
 */
export const formatCNPJ = (value: string): string => {
  // Remove caracteres não numéricos
  const cnpj = value.replace(/\D/g, '');
  
  // Limita a 14 dígitos
  const cnpjLimit = cnpj.slice(0, 14);
  
  // Formata o CNPJ: XX.XXX.XXX/XXXX-XX
  return cnpjLimit
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};
