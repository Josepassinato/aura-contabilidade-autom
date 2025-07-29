import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, FileText, ArrowRight, Lightbulb } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

interface EmptyStateProps {
  type: 'clients' | 'documents' | 'events';
  onLoadDemo: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onLoadDemo }) => {
  const { isClient } = useAuth();
  const configs = {
    clients: {
      icon: Users,
      title: 'Nenhum cliente cadastrado',
      description: 'Comece adicionando seu primeiro cliente para organizar melhor sua carteira.',
      suggestions: [
        'Cadastre informações básicas (nome, CNPJ, regime tributário)',
        'Configure alertas para prazos fiscais importantes',
        'Organize documentos por cliente'
      ]
    },
    documents: {
      icon: FileText,
      title: 'Nenhum documento enviado',
      description: 'Seus clientes ainda não enviaram documentos para processamento.',
      suggestions: [
        'Oriente clientes sobre upload de notas fiscais',
        'Configure lembretes automáticos de envio',
        'Defina categorias para organização'
      ]
    },
    events: {
      icon: FileText,
      title: 'Nenhum evento fiscal cadastrado',
      description: 'Mantenha-se em dia com todas as obrigações fiscais dos seus clientes.',
      suggestions: [
        'Configure prazos de DAS e declarações',
        'Defina lembretes automáticos',
        'Monitore vencimentos próximos'
      ]
    }
  };

  const config = configs[type];
  const IconComponent = config.icon;

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center text-center p-8">
        <div className="p-4 bg-primary/10 rounded-full mb-4">
          <IconComponent className="h-8 w-8 text-primary" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {config.description}
        </p>

        <div className="space-y-4 w-full max-w-md">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-blue-800 mb-2">Próximos passos:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  {config.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={onLoadDemo} variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Ver Exemplo
            </Button>
            {!isClient && (
              <Button className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Começar Agora
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};