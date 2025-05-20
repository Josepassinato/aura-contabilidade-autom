
import { z } from "zod";

export const federalFormSchema = z.object({
  receita: z.object({
    apiKey: z.string().min(1, { message: "A chave API é obrigatória" }),
    certificate: z.string().optional(),
  }),
  cnd: z.object({
    username: z.string().min(1, { message: "O usuário é obrigatório" }),
    password: z.string().min(1, { message: "A senha é obrigatória" }),
  }),
  cnpj: z.object({
    apiKey: z.string().min(1, { message: "A chave API é obrigatória" }),
  }),
});

export const estadualFormSchema = z.object({
  sp: z.object({
    apiKey: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    certificate: z.string().optional(),
  }),
  rj: z.object({
    apiKey: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    certificate: z.string().optional(),
  }),
  sc: z.object({
    apiKey: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    certificate: z.string().optional(),
  }),
  mg: z.object({
    apiKey: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    certificate: z.string().optional(),
  }),
});

export type FederalFormValues = z.infer<typeof federalFormSchema>;
export type EstadualFormValues = z.infer<typeof estadualFormSchema>;
