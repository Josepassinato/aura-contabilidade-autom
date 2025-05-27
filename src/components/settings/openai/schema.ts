
import { z } from "zod";

export const openAiConfigSchema = z.object({
  model: z.string().min(1, { message: "Selecione um modelo" }),
  temperature: z.coerce.number().min(0).max(2).default(0.7),
  maxTokens: z.coerce.number().min(100).max(16000).default(4000),
});

export type OpenAiConfigFormValues = z.infer<typeof openAiConfigSchema>;
