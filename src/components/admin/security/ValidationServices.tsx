import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ValidationServicesProps {
  onRunValidation: (type: 'fiscal_compliance' | 'data_integrity' | 'security_audit') => void;
  isLoading: boolean;
}

export function ValidationServices({ onRunValidation, isLoading }: ValidationServicesProps) {
  const services = [
    {
      id: 'fiscal_compliance' as const,
      title: 'Compliance Fiscal',
      description: 'Validação de conformidade fiscal e parâmetros',
      buttonText: 'Executar Validação Fiscal'
    },
    {
      id: 'data_integrity' as const,
      title: 'Integridade de Dados',
      description: 'Verificação da consistência dos dados',
      buttonText: 'Executar Validação de Dados'
    },
    {
      id: 'security_audit' as const,
      title: 'Auditoria de Segurança',
      description: 'Análise completa de segurança do sistema',
      buttonText: 'Executar Auditoria'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {services.map(service => (
        <Card key={service.id}>
          <CardHeader>
            <CardTitle>{service.title}</CardTitle>
            <CardDescription>{service.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onRunValidation(service.id)}
              disabled={isLoading}
              className="w-full"
            >
              {service.buttonText}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}