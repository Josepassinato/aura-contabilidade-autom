
import { z } from "zod";

export const databaseFormSchema = z.object({
  dbType: z.string().min(1, { message: "Selecione um tipo de banco de dados" }),
  host: z.string().min(1, { message: "O host é obrigatório" }),
  port: z.coerce.number().min(1).max(65535),
  database: z.string().min(1, { message: "O nome do banco de dados é obrigatório" }),
  username: z.string().min(1, { message: "O usuário é obrigatório" }),
  password: z.string().min(1, { message: "A senha é obrigatória" }),
  ssl: z.boolean().default(true),
});

export type DatabaseFormValues = z.infer<typeof databaseFormSchema>;
