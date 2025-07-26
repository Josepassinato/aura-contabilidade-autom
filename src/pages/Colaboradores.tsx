
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users } from "lucide-react";
import { ClientSelector } from '@/components/layout/ClientSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Colaborador {
  id: string;
  nome: string;
  cpf: string;
  cargo: string;
  departamento?: string;
  dataAdmissao: string;
  salarioBase: string;
  status: "ativo" | "inativo" | "ferias" | "licenca";
}

const Colaboradores = () => {
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [editingColaboradorId, setEditingColaboradorId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [deletingColaboradorId, setDeletingColaboradorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("lista");

  // Carregar colaboradores reais da base de dados
  useEffect(() => {
    const loadColaboradores = async () => {
      if (!selectedClientId) return;
      
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('client_id', selectedClientId)
          .order('name');

        if (error) {
          console.error('Erro ao carregar colaboradores:', error);
          return;
        }

        // Mapear dados da base para o formato do componente
        const colaboradoresData = data?.map(emp => ({
          id: emp.id,
          nome: emp.name,
          cpf: emp.cpf,
          cargo: emp.position,
          departamento: emp.department || 'geral',
          dataAdmissao: emp.hire_date,
          salarioBase: emp.base_salary?.toString() || '0.00',
          status: emp.status as "ativo" | "inativo" | "ferias" | "licenca"
        })) || [];

        setColaboradores(colaboradoresData);
      } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
      }
    };

    loadColaboradores();
  }, [selectedClientId]);
  
  const handleClientSelect = (client: { id: string, name: string }) => {
    setSelectedClientId(client.id);
  };
  
  const handleSaveColaborador = (data: any) => {
    if (editingColaboradorId) {
      // Atualizar colaborador existente
      setColaboradores(prev => 
        prev.map(c => c.id === editingColaboradorId ? {...data, id: editingColaboradorId} : c)
      );
      toast({
        title: "Colaborador atualizado",
        description: `${data.nome} foi atualizado com sucesso.`,
      });
    } else {
      // Adicionar novo colaborador
      const newColaborador = {
        ...data,
        id: Date.now().toString(),
      };
      setColaboradores(prev => [...prev, newColaborador]);
      toast({
        title: "Colaborador adicionado",
        description: `${data.nome} foi adicionado com sucesso.`,
      });
    }
    
    setEditingColaboradorId(null);
    setActiveTab("lista");
  };
  
  const handleEditColaborador = (id: string) => {
    const colaborador = colaboradores.find(c => c.id === id);
    if (colaborador) {
      setEditingColaboradorId(id);
      setActiveTab("adicionar");
    }
  };
  
  const handleDeleteIntent = (id: string) => {
    setDeletingColaboradorId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (deletingColaboradorId) {
      const colaborador = colaboradores.find(c => c.id === deletingColaboradorId);
      setColaboradores(prev => prev.filter(c => c.id !== deletingColaboradorId));
      
      toast({
        title: "Colaborador removido",
        description: colaborador ? `${colaborador.nome} foi removido com sucesso.` : "Colaborador removido com sucesso.",
      });
      
      setDeletingColaboradorId(null);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleAddNew = () => {
    setEditingColaboradorId(null);
    setActiveTab("adicionar");
  };

  // Função para formatar CPF
  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Colaboradores</h1>
          <p className="text-muted-foreground">
            Gerencie os colaboradores dos seus clientes
          </p>
        </div>
        <div>
          <ClientSelector onClientSelect={handleClientSelect} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="lista">Lista de Colaboradores</TabsTrigger>
          <TabsTrigger value="adicionar">
            {editingColaboradorId ? "Editar Colaborador" : "Adicionar Colaborador"}
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="lista">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Colaboradores</span>
                </CardTitle>
                <Button size="sm" onClick={handleAddNew}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent>
                {colaboradores.length === 0 ? (
                  <div className="text-center py-8">
                    <p>Nenhum colaborador cadastrado</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Nome</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">CPF</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Cargo</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {colaboradores.map((colaborador) => (
                          <tr key={colaborador.id}>
                            <td className="px-4 py-3 text-sm">{colaborador.nome}</td>
                            <td className="px-4 py-3 text-sm">{formatCPF(colaborador.cpf)}</td>
                            <td className="px-4 py-3 text-sm">{colaborador.cargo}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                colaborador.status === "ativo" ? "bg-green-100 text-green-800" :
                                colaborador.status === "ferias" ? "bg-blue-100 text-blue-800" :
                                colaborador.status === "licenca" ? "bg-yellow-100 text-yellow-800" :
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {colaborador.status === "ativo" ? "Ativo" :
                                 colaborador.status === "ferias" ? "Férias" :
                                 colaborador.status === "licenca" ? "Licença" : "Inativo"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditColaborador(colaborador.id)}
                              >
                                Editar
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteIntent(colaborador.id)}
                              >
                                Excluir
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="adicionar">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingColaboradorId ? "Editar Colaborador" : "Adicionar Novo Colaborador"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Formulário de cadastro de colaboradores estará disponível em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Deseja realmente excluir este colaborador?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Colaboradores;
