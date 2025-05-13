
import { UF } from "@/services/governamental/estadualIntegration";
import { IntegracaoEstadualStatus } from "./IntegracaoStatus";

// Lista de estados brasileiros com seu código UF
export const ESTADOS = [
  { uf: "AC" as UF, nome: "Acre" },
  { uf: "AL" as UF, nome: "Alagoas" },
  { uf: "AP" as UF, nome: "Amapá" },
  { uf: "AM" as UF, nome: "Amazonas" },
  { uf: "BA" as UF, nome: "Bahia" },
  { uf: "CE" as UF, nome: "Ceará" },
  { uf: "DF" as UF, nome: "Distrito Federal" },
  { uf: "ES" as UF, nome: "Espírito Santo" },
  { uf: "GO" as UF, nome: "Goiás" },
  { uf: "MA" as UF, nome: "Maranhão" },
  { uf: "MT" as UF, nome: "Mato Grosso" },
  { uf: "MS" as UF, nome: "Mato Grosso do Sul" },
  { uf: "MG" as UF, nome: "Minas Gerais" },
  { uf: "PA" as UF, nome: "Pará" },
  { uf: "PB" as UF, nome: "Paraíba" },
  { uf: "PR" as UF, nome: "Paraná" },
  { uf: "PE" as UF, nome: "Pernambuco" },
  { uf: "PI" as UF, nome: "Piauí" },
  { uf: "RJ" as UF, nome: "Rio de Janeiro" },
  { uf: "RN" as UF, nome: "Rio Grande do Norte" },
  { uf: "RS" as UF, nome: "Rio Grande do Sul" },
  { uf: "RO" as UF, nome: "Rondônia" },
  { uf: "RR" as UF, nome: "Roraima" },
  { uf: "SC" as UF, nome: "Santa Catarina" },
  { uf: "SP" as UF, nome: "São Paulo" },
  { uf: "SE" as UF, nome: "Sergipe" },
  { uf: "TO" as UF, nome: "Tocantins" }
];

// Função para obter integrações padrão para todos os estados
export const getDefaultIntegracoes = (): IntegracaoEstadualStatus[] => {
  return ESTADOS.map(estado => ({
    id: `sefaz_${estado.uf.toLowerCase()}`,
    nome: `SEFAZ-${estado.uf}`,
    uf: estado.uf,
    status: 'desconectado'
  }));
};
