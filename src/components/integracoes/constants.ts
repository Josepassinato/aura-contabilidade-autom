
import { UF } from "@/services/governamental/estadualIntegration";

// Lista de estados suportados
export const ESTADOS: Array<{uf: UF, nome: string}> = [
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'PR', nome: 'Paraná' }
];

// Using "export type" instead of "export" to fix the isolatedModules error
export type { IntegracaoEstadualStatus } from './IntegracaoStatus';
