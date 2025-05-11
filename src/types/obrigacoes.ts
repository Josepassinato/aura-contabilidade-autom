
export interface Obrigacao {
  id: number;
  nome: string;
  tipo: string;
  prazo: string;
  empresa: string;
  status: "pendente" | "atrasado" | "concluido";
  prioridade: "baixa" | "media" | "alta";
}
