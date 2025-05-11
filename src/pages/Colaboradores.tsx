
import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Users, UserPlus, Search, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([
    {
      id: "1",
      nome: "João Silva",
      cpf: "12345678900",
      cargo: "Analista Contábil",
      departamento: "contabilidade",
      dataAdmissao: "2023-01-15",
      salarioBase: "3500.00",
      status: "ativo",
    },
    {
      id: "2",
      nome: "Maria Oliveira",
      cpf: "98765432100",
      cargo: "Gerente Contábil",
      departamento: "fiscal",
      dataAdmissao: "2021-03-10",
      salarioBase: "5200.00",
      status: "ferias",
    }
  ]);
  
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    cargo: '',
    departamento: '',
    dataAdmissao: '',
    salarioBase: '',
    status: 'ativo'
  });
  const [editingColaboradorId, setEditingColaboradorId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [deletingColaboradorId, setDeletingColaboradorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("lista");
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleClientSelect = (client: { id: string, name: string }) => {
    setSelectedClientId(client.id);
    setSelectedClientName(client.name);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveColaborador(formData);
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
    
    // Resetar formulário e estado
    setFormData({
      nome: '',
      cpf: '',
      cargo: '',
      departamento: '',
      dataAdmissao: '',
      salarioBase: '',
      status: 'ativo'
    });
    setEditingColaboradorId(null);
    setActiveTab("lista");
  };
  
  const handleEditColaborador = (id: string) => {
    const colaborador = colaboradores.find(c => c.id === id);
    if (colaborador) {
      setFormData({
        nome: colaborador.nome,
        cpf: colaborador.cpf,
        cargo: colaborador.cargo,
        departamento: colaborador.departamento || '',
        dataAdmissao: colaborador.dataAdmissao,
        salarioBase: colaborador.salarioBase,
        status: colaborador.status
      });
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
    setFormData({
      nome: '',
      cpf: '',
      cargo: '',
      departamento: '',
      dataAdmissao: '',
      salarioBase: '',
      status: 'ativo'
    });
    setEditingColaboradorId(null);
    setActiveTab("adicionar");
  };

  // Função para formatar CPF
  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };
  
  // Filtrar colaboradores por termo de busca
  const filteredColaboradores = colaboradores.filter(colaborador => 
    colaborador.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    colaborador.cpf.includes(searchTerm) ||
    colaborador.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Ativo</Badge>;
      case 'inativo':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inativo</Badge>;
      case 'ferias':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Férias</Badge>;
      case 'licenca':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Licença</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Colaboradores</h1>
            <p className="text-muted-foreground">
              Gerencie os colaboradores dos seus clientes
            </p>
          </div>
          <ClientSelector onClientSelect={handleClientSelect} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lista">Lista de Colaboradores</TabsTrigger>
            <TabsTrigger value="adicionar">
              {editingColaboradorId ? "Editar Colaborador" : "Adicionar Colaborador"}
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="lista">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <CardTitle>Colaboradores</CardTitle>
                    </div>
                    <Button onClick={handleAddNew}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Novo Colaborador
                    </Button>
                  </div>
                  <CardDescription>
                    Gerencie os colaboradores cadastrados
                  </CardDescription>
                  <div className="mt-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, CPF ou cargo..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="py-3 px-4 text-left font-medium">Nome</th>
                          <th className="py-3 px-4 text-left font-medium">CPF</th>
                          <th className="py-3 px-4 text-left font-medium">Cargo</th>
                          <th className="py-3 px-4 text-left font-medium">Status</th>
                          <th className="py-3 px-4 text-right font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredColaboradores.length > 0 ? (
                          filteredColaboradores.map((colaborador) => (
                            <tr key={colaborador.id} className="border-b">
                              <td className="py-3 px-4">{colaborador.nome}</td>
                              <td className="py-3 px-4">{formatCPF(colaborador.cpf)}</td>
                              <td className="py-3 px-4">{colaborador.cargo}</td>
                              <td className="py-3 px-4">{getStatusBadge(colaborador.status)}</td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditColaborador(colaborador.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteIntent(colaborador.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-muted-foreground">
                              Nenhum colaborador encontrado
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="adicionar">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    <CardTitle>
                      {editingColaboradorId ? "Editar Colaborador" : "Adicionar Novo Colaborador"}
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Preencha os dados do colaborador
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="nome" className="text-sm font-medium">Nome Completo</label>
                        <Input 
                          id="nome"
                          name="nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="cpf" className="text-sm font-medium">CPF</label>
                        <Input 
                          id="cpf"
                          name="cpf"
                          value={formData.cpf}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="cargo" className="text-sm font-medium">Cargo</label>
                        <Input 
                          id="cargo"
                          name="cargo"
                          value={formData.cargo}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="departamento" className="text-sm font-medium">Departamento</label>
                        <Input 
                          id="departamento"
                          name="departamento"
                          value={formData.departamento}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="dataAdmissao" className="text-sm font-medium">Data de Admissão</label>
                        <Input 
                          id="dataAdmissao"
                          name="dataAdmissao"
                          type="date"
                          value={formData.dataAdmissao}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="salarioBase" className="text-sm font-medium">Salário Base</label>
                        <Input 
                          id="salarioBase"
                          name="salarioBase"
                          type="text"
                          value={formData.salarioBase}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="status" className="text-sm font-medium">Status</label>
                        <Select 
                          value={formData.status}
                          onValueChange={(value) => handleSelectChange('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                            <SelectItem value="ferias">Férias</SelectItem>
                            <SelectItem value="licenca">Licença</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setActiveTab("lista")}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingColaboradorId ? "Atualizar" : "Salvar"}
                      </Button>
                    </div>
                  </form>
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
                Tem certeza que deseja excluir este colaborador?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Colaboradores;
