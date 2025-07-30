import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';

interface SecureDocument {
  id: string;
  title: string;
  name: string;
  type: string;
  status: string;
  created_at: string;
  size?: number;
  access_level: 'public' | 'restricted' | 'private';
  can_download: boolean;
  can_view: boolean;
  last_accessed?: string;
}

interface SecureDocumentsProps {
  clientId: string;
}

export const SecureDocuments = ({ clientId }: SecureDocumentsProps) => {
  const [documents, setDocuments] = useState<SecureDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<SecureDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [accessAttempts, setAccessAttempts] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const { userProfile, isClient } = useAuth();

  useEffect(() => {
    if (clientId) {
      loadSecureDocuments();
    }
  }, [clientId]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, statusFilter]);

  const loadSecureDocuments = async () => {
    try {
      setLoading(true);

      // Buscar documentos com validação de permissões
      const { data: clientDocs, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapear documentos com informações de segurança
      const secureDocuments: SecureDocument[] = (clientDocs || []).map(doc => {
        // Determinar nível de acesso baseado no tipo e status
        let access_level: 'public' | 'restricted' | 'private' = 'restricted';
        let can_download = true;
        let can_view = true;

        // Lógica de permissões baseada no tipo de documento e role do usuário
        if (doc.type === 'confidential' || doc.status === 'draft') {
          access_level = 'private';
          can_download = !isClient;
          can_view = !isClient;
        } else if (doc.type === 'fiscal' || doc.type === 'legal') {
          access_level = 'restricted';
          can_download = true;
          can_view = true;
        } else {
          access_level = 'public';
        }

        // Clientes só podem ver documentos aprovados
        if (isClient && doc.status !== 'approved') {
          can_view = false;
          can_download = false;
        }

        return {
          id: doc.id,
          title: doc.title,
          name: doc.name,
          type: doc.type,
          status: doc.status,
          created_at: doc.created_at || '',
          size: doc.size,
          access_level,
          can_download,
          can_view
        };
      });

      setDocuments(secureDocuments);

    } catch (error) {
      console.error('Erro ao carregar documentos seguros:', error);
      toast({
        title: "Erro ao carregar documentos",
        description: "Não foi possível carregar os documentos com segurança",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    // Aplicar filtro de segurança - esconder documentos sem permissão de visualização
    filtered = filtered.filter(doc => doc.can_view);

    setFilteredDocuments(filtered);
  };

  const handleSecureAccess = async (document: SecureDocument, action: 'view' | 'download') => {
    try {
      // Verificar permissões antes de permitir acesso
      if (action === 'download' && !document.can_download) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para baixar este documento",
          variant: "destructive"
        });
        return;
      }

      if (action === 'view' && !document.can_view) {
        toast({
          title: "Acesso negado", 
          description: "Você não tem permissão para visualizar este documento",
          variant: "destructive"
        });
        return;
      }

      // Registrar tentativa de acesso
      const attempts = accessAttempts[document.id] || 0;
      setAccessAttempts(prev => ({
        ...prev,
        [document.id]: attempts + 1
      }));

      // Log de auditoria de acesso
      await logDocumentAccess(document.id, action);

      // Simular ação (em produção, seria download/view real)
      if (action === 'download') {
        toast({
          title: "Download iniciado",
          description: `Baixando ${document.name}...`
        });
      } else {
        toast({
          title: "Abrindo documento",
          description: `Visualizando ${document.name}...`
        });
      }

    } catch (error) {
      console.error('Erro no acesso seguro:', error);
      toast({
        title: "Erro de acesso",
        description: "Não foi possível acessar o documento",
        variant: "destructive"
      });
    }
  };

  const logDocumentAccess = async (documentId: string, action: string) => {
    try {
      // Log de auditoria via audit_logs
      const { error } = await supabase
        .from('audit_logs')
        .insert([{
          table_name: 'client_documents',
          record_id: documentId,
          operation: `DOCUMENT_${action.toUpperCase()}`,
          new_values: {
            action,
            document_id: documentId,
            client_id: clientId,
            user_profile: userProfile?.role,
            timestamp: new Date().toISOString()
          },
          metadata: {
            security_level: 'document_access',
            ip_address: 'client_browser'
          },
          severity: 'info',
          source: 'client_portal'
        }]);

      if (error) {
        console.error('Erro ao registrar log de auditoria:', error);
      }
    } catch (error) {
      console.error('Erro ao fazer log de acesso:', error);
    }
  };

  const getAccessLevelBadge = (level: string) => {
    const variants = {
      public: 'default',
      restricted: 'secondary', 
      private: 'destructive'
    } as const;

    const labels = {
      public: 'Público',
      restricted: 'Restrito',
      private: 'Privado'
    };

    return (
      <Badge variant={variants[level as keyof typeof variants]}>
        <Shield className="h-3 w-3 mr-1" />
        {labels[level as keyof typeof labels]}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Filtros de segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Documentos Seguros
            <Badge variant="outline" className="ml-auto">
              {filteredDocuments.length} visíveis
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Todos os status</option>
              <option value="approved">Aprovados</option>
              <option value="pending">Pendentes</option>
              <option value="rejected">Rejeitados</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de documentos seguros */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDocuments.length > 0 ? (
          filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {getStatusIcon(document.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{document.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{document.name}</p>
                      <div className="flex items-center gap-2 mb-2">
                        {getAccessLevelBadge(document.access_level)}
                        <Badge variant="outline">{document.type}</Badge>
                        <Badge variant={document.status === 'approved' ? 'default' : 'secondary'}>
                          {document.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tamanho: {formatFileSize(document.size)} • 
                        Criado: {new Date(document.created_at).toLocaleDateString('pt-BR')}
                        {accessAttempts[document.id] && (
                          <span className="ml-2">• Acessos: {accessAttempts[document.id]}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSecureAccess(document, 'view')}
                      disabled={!document.can_view}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSecureAccess(document, 'download')}
                      disabled={!document.can_download}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Nenhum documento encontrado ou você não tem permissão para visualizá-los.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};