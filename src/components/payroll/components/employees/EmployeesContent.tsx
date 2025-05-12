
import React from 'react';
import { Employee } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, Users, Plus } from "lucide-react";

interface EmployeesContentProps {
  employees: Employee[];
  isLoading: boolean;
  selectedClientId: string | null;
  activeTab: string;
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
}

export function EmployeesContent({
  employees,
  isLoading,
  selectedClientId,
  activeTab,
  onAddEmployee,
  onEditEmployee
}: EmployeesContentProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>;
      case 'vacation':
        return <Badge className="bg-blue-100 text-blue-800">Férias</Badge>;
      case 'leave':
        return <Badge className="bg-yellow-100 text-yellow-800">Licença</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  if (!selectedClientId) {
    return (
      <div className="border rounded-md py-8 text-center">
        <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-1">Selecione um cliente</h3>
        <p className="text-sm text-muted-foreground">
          Selecione um cliente para visualizar seus funcionários.
        </p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="border rounded-md py-8 text-center">
        <div className="py-8 text-center">Carregando funcionários...</div>
      </div>
    );
  }
  
  if (employees.length === 0) {
    return (
      <div className="border rounded-md py-8 text-center">
        <User className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-1">Nenhum funcionário encontrado</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {activeTab === "todos" 
            ? "Este cliente não possui funcionários cadastrados." 
            : `Este cliente não possui funcionários ${activeTab === "ativos" ? "ativos" : "inativos"}.`}
        </p>
        <Button onClick={onAddEmployee} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Funcionário
        </Button>
      </div>
    );
  }
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Data de Admissão</TableHead>
            <TableHead>Salário Base</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.name}</TableCell>
              <TableCell>{employee.position}</TableCell>
              <TableCell>{employee.department || "-"}</TableCell>
              <TableCell>{formatDate(employee.hire_date)}</TableCell>
              <TableCell>{formatCurrency(employee.base_salary)}</TableCell>
              <TableCell>{getStatusBadge(employee.status)}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEditEmployee(employee)}
                >
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
