
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { configurarFonteDados, FonteDadosConfig } from "@/services/fiscal/integration";

interface UseFonteDadosFormProps {
  cnpj?: string;
  onComplete?: () => void;
}

interface FormState {
  // ERP fields
  erpUrl: string;
  erpUsuario: string;
  erpSenha: string;
  erpToken: string;
  
  // NFe fields
  nfeToken: string;
  nfeCertificado: File | null;
  nfeSenhaCertificado: string;
  
  // Contabilidade fields
  contabilidadeUrl: string;
  contabilidadeUsuario: string;
  contabilidadeSenha: string;
  contabilidadeIntegracao: string;
  
  // Common fields
  periodoInicial: string;
  periodoFinal: string;
  sincronizacaoAutomatica: boolean;
}

export function useFonteDadosForm({ cnpj = '', onComplete }: UseFonteDadosFormProps) {
  const [activeTab, setActiveTab] = useState<string>("erp");
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formState, setFormState] = useState<FormState>({
    // ERP fields
    erpUrl: "",
    erpUsuario: "",
    erpSenha: "",
    erpToken: "",
    
    // NFe fields
    nfeToken: "",
    nfeCertificado: null,
    nfeSenhaCertificado: "",
    
    // Contabilidade fields
    contabilidadeUrl: "",
    contabilidadeUsuario: "",
    contabilidadeSenha: "",
    contabilidadeIntegracao: "manual",
    
    // Common fields
    periodoInicial: "",
    periodoFinal: "",
    sincronizacaoAutomatica: false,
  });

  // Field updaters
  const updateField = (field: keyof FormState, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSalvarConfiguracao = async () => {
    try {
      setIsLoading(true);
      
      let config: FonteDadosConfig = {
        tipo: activeTab as 'erp' | 'contabilidade' | 'nfe' | 'manual',
        periodoInicial: formState.periodoInicial,
        periodoFinal: formState.periodoFinal,
        cnpj
      };
      
      switch (activeTab) {
        case "erp":
          config.credenciais = {
            url: formState.erpUrl,
            usuario: formState.erpUsuario,
            senha: formState.erpSenha,
            token: formState.erpToken
          };
          config.endpointUrl = formState.erpUrl;
          break;
          
        case "nfe":
          config.credenciais = {
            token: formState.nfeToken,
            senhaCertificado: formState.nfeSenhaCertificado
          };
          break;
          
        case "contabilidade":
          config.credenciais = {
            url: formState.contabilidadeUrl,
            usuario: formState.contabilidadeUsuario,
            senha: formState.contabilidadeSenha,
            tipoIntegracao: formState.contabilidadeIntegracao
          };
          config.endpointUrl = formState.contabilidadeUrl;
          break;
      }
      
      const result = await configurarFonteDados(config);
      
      if (result) {
        toast({
          title: "Integração configurada",
          description: `Fonte de dados ${activeTab.toUpperCase()} configurada com sucesso.`
        });
        
        if (onComplete) {
          onComplete();
        }
      }
    } catch (error) {
      console.error("Erro ao configurar fonte de dados:", error);
      toast({
        title: "Erro na configuração",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar a configuração",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    isLoading,
    formState,
    updateField,
    handleSalvarConfiguracao
  };
}
