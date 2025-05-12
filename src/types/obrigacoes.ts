
export interface Obrigacao {
  id: number | string;  // Agora aceita tanto número quanto string (UUID)
  nome: string;
  tipo: string;
  prazo: string;
  empresa: string;
  status: "pendente" | "atrasado" | "concluido";
  prioridade: "baixa" | "media" | "alta";
}
