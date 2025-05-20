
// Arquivo de barril para expor todos os módulos relacionados às procurações

export * from "./types";
export * from "./procuracaoService";
export * from "./procuracaoValidador";
export * from "./procuracaoLogger";
export * from "./ecacProcuracao";

// Não exportamos o procuracaoRepository.ts pois é um detalhe de implementação
