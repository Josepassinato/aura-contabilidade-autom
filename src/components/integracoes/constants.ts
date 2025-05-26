
import { UF } from "@/services/governamental/estadualIntegration";
import { IntegracaoEstadualStatus } from "./IntegracaoStatus";

// Lista de estados brasileiros com seu código UF
export const ESTADOS = [
  { uf: "AC" as UF, nome: "Acre", disponivel: true },
  { uf: "AL" as UF, nome: "Alagoas", disponivel: true },
  { uf: "AP" as UF, nome: "Amapá", disponivel: true },
  { uf: "AM" as UF, nome: "Amazonas", disponivel: true },
  { uf: "BA" as UF, nome: "Bahia", disponivel: true },
  { uf: "CE" as UF, nome: "Ceará", disponivel: true },
  { uf: "DF" as UF, nome: "Distrito Federal", disponivel: true },
  { uf: "ES" as UF, nome: "Espírito Santo", disponivel: true },
  { uf: "GO" as UF, nome: "Goiás", disponivel: true },
  { uf: "MA" as UF, nome: "Maranhão", disponivel: true },
  { uf: "MT" as UF, nome: "Mato Grosso", disponivel: true },
  { uf: "MS" as UF, nome: "Mato Grosso do Sul", disponivel: true },
  { uf: "MG" as UF, nome: "Minas Gerais", disponivel: true },
  { uf: "PA" as UF, nome: "Pará", disponivel: true },
  { uf: "PB" as UF, nome: "Paraíba", disponivel: true },
  { uf: "PR" as UF, nome: "Paraná", disponivel: true },
  { uf: "PE" as UF, nome: "Pernambuco", disponivel: true },
  { uf: "PI" as UF, nome: "Piauí", disponivel: true },
  { uf: "RJ" as UF, nome: "Rio de Janeiro", disponivel: true },
  { uf: "RN" as UF, nome: "Rio Grande do Norte", disponivel: true },
  { uf: "RS" as UF, nome: "Rio Grande do Sul", disponivel: true },
  { uf: "RO" as UF, nome: "Rondônia", disponivel: true },
  { uf: "RR" as UF, nome: "Roraima", disponivel: true },
  { uf: "SC" as UF, nome: "Santa Catarina", disponivel: true },
  { uf: "SP" as UF, nome: "São Paulo", disponivel: true },
  { uf: "SE" as UF, nome: "Sergipe", disponivel: true },
  { uf: "TO" as UF, nome: "Tocantins", disponivel: true }
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
