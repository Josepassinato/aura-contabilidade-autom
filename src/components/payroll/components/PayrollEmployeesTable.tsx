
import React from 'react';
import { Employee } from '@/lib/supabase';
import { formatCurrency } from '../hooks/usePayrollGenerator';
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PayrollEmployeesTableProps {
  employees: Employee[];
  isLoading: boolean;
  selectedEmployees: string[];
  toggleEmployeeSelection: (employeeId: string) => void;
  toggleAllEmployees: () => void;
}

export function PayrollEmployeesTable({
  employees,
  isLoading,
  selectedEmployees,
  toggleEmployeeSelection,
  toggleAllEmployees
}: PayrollEmployeesTableProps) {
  
  if (isLoading) {
    return <div className="py-8 text-center">Carregando funcionários...</div>;
  }
  
  if (employees.length === 0) {
    return (
      <div className="py-8 text-center">
        Nenhum funcionário ativo encontrado para este cliente.
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={selectedEmployees.length === employees.length}
              onCheckedChange={toggleAllEmployees}
            />
          </TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Cargo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Salário Base</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell>
              <Checkbox
                checked={selectedEmployees.includes(employee.id)}
                onCheckedChange={() => toggleEmployeeSelection(employee.id)}
              />
            </TableCell>
            <TableCell className="font-medium">{employee.name}</TableCell>
            <TableCell>{employee.position}</TableCell>
            <TableCell>
              <Badge className="bg-green-100 text-green-800">Ativo</Badge>
            </TableCell>
            <TableCell>{formatCurrency(employee.base_salary)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
