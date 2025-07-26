import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, FileText, ArrowRight, Lightbulb } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  type: 'clients' | 'documents' | 'events';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  const { isClient } = useAuth();
  const configs = {
    clients: {
      icon: Users,
      title: 'Nenhum cliente cadastrado',
      description: 'Comece adicionando seu primeiro cliente para organizar melhor sua carteira.',
      suggestions: [
        'Cadastre informações básicas (nome, CNPJ, regime tributário)',
        'Configure obrigações fiscais específicas',
        'Organize documentos por cliente'
      ],
      action: {
        label: 'Cadastrar Cliente',
        href: '/clientes'
      }
    },
    documents: {
      icon: FileText,
      title: 'Nenhum documento encontrado',
      description: 'Seus documentos aparecerão aqui conforme você os processar.',
      suggestions: [
        'Faça upload de notas fiscais e extratos',
        'Configure upload automático',
        'Organize por categorias'
      ],
      action: {
        label: 'Upload de Documentos',
        href: '/documentos'
      }
    },
    events: {
      icon: ArrowRight,
      title: 'Nenhum evento fiscal próximo',
      description: 'Quando houver obrigações fiscais próximas, elas aparecerão aqui.',
      suggestions: [
        'Configure lembretes automáticos',
        'Mantenha o calendário fiscal atualizado',
        'Acompanhe prazos importantes'
      ],
      action: {
        label: 'Ver Calendário',
        href: '/calendario'
      }
    }
  };

  const config = configs[type];
  const IconComponent = config.icon;

  return (
    <Card className="border-dashed border-2 border-muted-foreground/20">
      <CardContent className="flex flex-col items-center justify-center text-center p-8">
        <div className="rounded-full bg-muted p-4 mb-4">
          <IconComponent className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          {config.title}
        </h3>
        
        <p className="text-muted-foreground mb-6 max-w-sm">
          {config.description}
        </p>

        <div className="space-y-2 mb-6 text-left w-full max-w-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Lightbulb className="h-4 w-4" />
            <span className="text-sm font-medium">Dicas:</span>
          </div>
          {config.suggestions.map((suggestion, index) => (
            <div key={index} className="text-sm text-muted-foreground pl-6">
              • {suggestion}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Link to={config.action.href}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {config.action.label}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};