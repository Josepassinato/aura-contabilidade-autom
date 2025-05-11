
import { Obrigacao } from "@/types/obrigacoes";

/**
 * Get obligations for a specific day
 */
export const getObrigacoesDoDia = (
  dia: number | null, 
  mes: number, 
  ano: number, 
  obrigacoes: Obrigacao[]
): Obrigacao[] => {
  if (!dia) return [];
  
  const diaFormatado = dia.toString().padStart(2, '0');
  const mesFormatado = mes.toString().padStart(2, '0');
  
  return obrigacoes.filter(obrigacao => {
    // Assume that prazo is in the format DD/MM/YYYY
    const [prazoDia, prazoMes] = obrigacao.prazo.split('/');
    return prazoDia === diaFormatado && prazoMes === mesFormatado;
  });
};
