
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Check } from "lucide-react";

const colaboradorSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  role: z.enum(["admin", "contador", "assistente"], { 
    required_error: "Selecione uma função" 
  }),
});

type ColaboradorFormValues = z.infer<typeof colaboradorSchema>;

interface EquipeFormProps {
  onSubmit: (data: ColaboradorFormValues[]) => void;
}

export function EquipeForm({ onSubmit }: EquipeFormProps) {
  const [colaboradores, setColaboradores] = useState<ColaboradorFormValues[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const form = useForm<ColaboradorFormValues>({
    resolver: zodResolver(colaboradorSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "contador",
    },
  });

  const addColaborador = (data: ColaboradorFormValues) => {
    setColaboradores([...colaboradores, data]);
    form.reset();
    setIsAdding(false);
    
    toast({
      title: "Colaborador adicionado",
      description: `${data.name} foi adicionado à sua equipe.`,
    });
  };

  const removeColaborador = (index: number) => {
    const updatedColaboradores = [...colaboradores];
    updatedColaboradores.splice(index, 1);
    setColaboradores(updatedColaboradores);
    
    toast({
      title: "Colaborador removido",
      description: "O colaborador foi removido da sua equipe.",
    });
  };

  const handleSubmitForm = () => {
    onSubmit(colaboradores);
  };

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    contador: "Contador",
    assistente: "Assistente",
  };

  return (
    <div className="space-y-6">
      {colaboradores.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-medium">Colaboradores ({colaboradores.length})</h3>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium">Nome</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Email</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Função</th>
                  <th className="px-4 py-2 text-right text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {colaboradores.map((colaborador, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-3 text-sm">{colaborador.name}</td>
                    <td className="px-4 py-3 text-sm">{colaborador.email}</td>
                    <td className="px-4 py-3 text-sm">{roleLabels[colaborador.role]}</td>
                    <td className="px-4 py-3 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeColaborador(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center p-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">Nenhum colaborador adicionado</p>
        </div>
      )}

      {isAdding ? (
        <div className="border p-4 rounded-md bg-muted/10">
          <h3 className="font-medium mb-4">Adicionar Colaborador</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(addColaborador)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="joao@exemplo.com.br" type="email" {...field} />
                    </FormControl>
                    <FormDescription>
                      Um email de convite será enviado para este endereço.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma função" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="contador">Contador</SelectItem>
                        <SelectItem value="assistente">Assistente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Define as permissões que o colaborador terá no sistema.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAdding(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  <Check className="h-4 w-4 mr-2" /> Adicionar
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : (
        <Button 
          variant="outline" 
          onClick={() => setIsAdding(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" /> Adicionar Colaborador
        </Button>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={handleSubmitForm} disabled={colaboradores.length === 0}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
