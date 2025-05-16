
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface EmployeeInfoProps {
  employeeData: any;
}

export function EmployeeInfo({ employeeData }: EmployeeInfoProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h4 className="font-semibold mb-4">Dados do Funcionário</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nome:</span>
            <span className="font-medium">{employeeData?.name || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">CPF:</span>
            <span>{employeeData?.cpf || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cargo:</span>
            <span>{employeeData?.position || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Departamento:</span>
            <span>{employeeData?.department || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Data de Admissão:</span>
            <span>{employeeData?.hire_date ? new Date(employeeData.hire_date).toLocaleDateString('pt-BR') : '-'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
