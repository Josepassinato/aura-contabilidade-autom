
import * as z from "zod";

export const estadualFormSchema = z.object({
  certificadoDigital: z.string().min(1, {
    message: "Selecione um certificado digital",
  }).optional(),
  senha: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres",
  }).optional(),
  codigoAcesso: z.string().optional(),
  usuario: z.string().min(1, {
    message: "O usuário é obrigatório",
  }).optional(),
});

export type EstadualFormValues = z.infer<typeof estadualFormSchema>;
