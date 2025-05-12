
import { UF } from "@/services/governamental/estadualIntegration";
import { IntegracaoEstadualStatus } from './IntegracaoStatus';

// Lista de estados suportados
export const ESTADOS: Array<{uf: UF, nome: string}> = [
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'PR', nome: 'Paraná' }
];

// Get default state integrations with disconnected status
export const getDefaultIntegracoes = (): IntegracaoEstadualStatus[] => {
  return ESTADOS.map(estado => ({
    id: `sefaz_${estado.uf.toLowerCase()}`,
    nome: `SEFAZ-${estado.uf}`,
    uf: estado.uf,
    status: 'desconectado' as const,
  }));
};

// Using "export type" instead of "export" to fix the isolatedModules error
export type { IntegracaoEstadualStatus } from './IntegracaoStatus';
