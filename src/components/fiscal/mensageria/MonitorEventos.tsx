
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, AlertTriangle, Activity, RefreshCw } from "lucide-react";
import { 
  assinarEvento, 
  TipoEvento, 
  Evento as EventoMensageria
} from "@/services/fiscal/mensageria/eventoProcessor";

export function MonitorEventos() {
  const [eventos, setEventos] = useState<EventoMensageria[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<TipoEvento | 'todos'>('todos');
  
  // Assina todos os tipos de eventos quando o componente é montado
  useEffect(() => {
    const canceladores: (() => void)[] = [];
    
    const tiposEvento: TipoEvento[] = [
      'bank.transaction',
      'entry.created',
      'entry.classified',
      'entry.reconciled',
      'fiscal.calculated',
      'fiscal.generated'
    ];
    
    // Assina cada tipo de evento
    tiposEvento.forEach(tipo => {
      const cancelar = assinarEvento(tipo, (evento) => {
        setEventos(prev => [evento, ...prev].slice(0, 100));
      });
      canceladores.push(cancelar);
    });
    
    // Cancela todas as assinaturas quando o componente é desmontado
    return () => {
      canceladores.forEach(cancelar => cancelar());
    };
  }, []);
  
  // Filtra eventos por tipo
  const eventosFiltrados = filtroTipo === 'todos'
    ? eventos
    : eventos.filter(evento => evento.tipo === filtroTipo);
  
  // Determina a cor do badge com base no tipo de evento
  const getBadgeVariant = (tipo: TipoEvento) => {
    switch (tipo) {
      case 'bank.transaction':
        return 'default';
      case 'entry.created':
        return 'outline';
      case 'entry.classified':
        return 'secondary';
      case 'entry.reconciled':
        return 'default';
      case 'fiscal.calculated':
        return 'destructive';
      case 'fiscal.generated':
        return 'default';
      default:
        return 'outline';
    }
  };
  
  // Formata a hora do evento
  const formatarHora = (timestamp: string) => {
    const data = new Date(timestamp);
    return data.toLocaleTimeString();
  };
  
  // Limpa o histórico de eventos
  const limparHistorico = () => {
    setEventos([]);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Monitor de Eventos
            </CardTitle>
            <CardDescription>
              Mensagens em tempo real do sistema de mensageria (Rabbit/Kafka)
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as TipoEvento | 'todos')}
              className="border rounded-md p-1 text-sm"
            >
              <option value="todos">Todos os eventos</option>
              <option value="bank.transaction">bank.transaction</option>
              <option value="entry.created">entry.created</option>
              <option value="entry.classified">entry.classified</option>
              <option value="entry.reconciled">entry.reconciled</option>
              <option value="fiscal.calculated">fiscal.calculated</option>
              <option value="fiscal.generated">fiscal.generated</option>
            </select>
            <Button variant="outline" size="sm" onClick={limparHistorico}>
              Limpar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {eventos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p>Nenhum evento capturado ainda.</p>
            <p className="text-sm">Os eventos aparecerão aqui quando forem publicados.</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {eventosFiltrados.map((evento) => (
                <div 
                  key={evento.id} 
                  className="p-3 border rounded-md hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <Badge variant={getBadgeVariant(evento.tipo)} className="mr-2">
                        {evento.tipo}
                      </Badge>
                      <span className="text-sm font-medium">{formatarHora(evento.timestamp)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Origem: {evento.origem}
                    </div>
                  </div>
                  
                  <div className="text-sm mt-1">
                    <pre className="whitespace-pre-wrap bg-slate-50 p-2 rounded text-xs overflow-auto max-h-28">
                      {JSON.stringify(evento.payload, null, 2)}
                    </pre>
                  </div>
                  
                  {evento.correlationId && (
                    <div className="text-xs text-muted-foreground mt-1">
                      ID de Correlação: {evento.correlationId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
