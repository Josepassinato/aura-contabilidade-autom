
import { UF } from "@/services/governamental/estadualIntegration";
import { IntegracaoEstadualStatus } from './IntegracaoStatus';

export const ESTADOS: Array<{uf: UF, nome: string}> = [
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'PR', nome: 'Paraná' }
];

export const getDefaultIntegracoes = (): IntegracaoEstadualStatus[] => [
  {
    id: "sefaz_sp",
    nome: "SEFAZ-SP",
    uf: "SP",
    status: 'desconectado',
  },
  {
    id: "sefaz_rj",
    nome: "SEFAZ-RJ",
    uf: "RJ",
    status: 'desconectado',
  },
  {
    id: "sefaz_mg",
    nome: "SEFAZ-MG",
    uf: "MG",
    status: 'desconectado',
  },
  {
    id: "sefaz_rs",
    nome: "SEFAZ-RS",
    uf: "RS",
    status: 'desconectado',
  },
  {
    id: "sefaz_pr",
    nome: "SEFAZ-PR",
    uf: "PR",
    status: 'desconectado',
  },
];

export const getClientOneIntegracoes = (): IntegracaoEstadualStatus[] => [
  {
    id: "sefaz_sp",
    nome: "SEFAZ-SP",
    uf: "SP",
    status: 'conectado',
    ultimoAcesso: "10/05/2025 15:30",
    proximaRenovacao: "10/06/2025",
  },
  {
    id: "sefaz_rj",
    nome: "SEFAZ-RJ",
    uf: "RJ",
    status: 'erro',
    ultimoAcesso: "05/05/2025 10:15",
    mensagem: "Certificado expirado"
  },
  {
    id: "sefaz_mg",
    nome: "SEFAZ-MG",
    uf: "MG",
    status: 'desconectado',
  },
  {
    id: "sefaz_rs",
    nome: "SEFAZ-RS",
    uf: "RS",
    status: 'conectado',
    ultimoAcesso: "09/05/2025 08:45",
    proximaRenovacao: "09/06/2025",
  },
  {
    id: "sefaz_pr",
    nome: "SEFAZ-PR",
    uf: "PR",
    status: 'desconectado',
  },
];

// Changed from 'export { IntegracaoEstadualStatus }' to 'export type { IntegracaoEstadualStatus }'
export type { IntegracaoEstadualStatus } from './IntegracaoStatus';
