
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface TaxObligationProps {
  clientId: string;
}

interface TaxObligationItem {
  id: string;
  nome: string;
  prazo: string;
  valor?: string;
  status: 'pendente' | 'pago' | 'vencido';
}

export const TaxObligations = ({ clientId }: TaxObligationProps) => {
  const [obligations, setObligations] = useState<TaxObligationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadObligations = async () => {
      if (!clientId) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('obrigacoes_fiscais')
          .select('id, nome, prazo, status')
          .eq('client_id', clientId)
          .order('prazo', { ascending: true });

        if (error) {
          console.error('Erro ao buscar obrigações fiscais:', error);
          setObligations([]);
          return;
        }

        if (data) {
          const formattedObligations = data.map(obligation => ({
            id: obligation.id,
            nome: obligation.nome,
            prazo: obligation.prazo,
            status: obligation.status as 'pendente' | 'pago' | 'vencido'
          }));
          setObligations(formattedObligations);
        } else {
          setObligations([]);
        }
      } catch (error) {
        console.error('Erro ao buscar obrigações fiscais:', error);
        setObligations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadObligations();
  }, [clientId]);

  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'pago': return 'bg-green-100 text-green-800';
      case 'vencido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Obrigações Fiscais
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Carregando obrigações...</p>
          </div>
        ) : obligations.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">Nenhuma obrigação fiscal encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {obligations.map(obligation => (
              <div key={obligation.id} className="flex justify-between p-3 border rounded-md">
                <div>
                  <p className="font-medium">{obligation.nome}</p>
                  <p className="text-sm text-muted-foreground">Prazo: {obligation.prazo}</p>
                </div>
                <div className="text-right">
                  {obligation.valor && <p className="font-medium">{obligation.valor}</p>}
                  <p className={`text-xs px-2 py-1 rounded-full inline-block ${getStatusClassName(obligation.status)}`}>
                    {obligation.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
