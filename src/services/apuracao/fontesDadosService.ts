
import { FonteDadosConfig } from "@/components/apuracao/FontesDadosAutomaticas";
import { toast } from "@/hooks/use-toast";

// Chave para armazenar configurações no localStorage
const STORAGE_KEY = 'apuracao_fontes_dados_config';

// Funções para lidar com as configurações de fontes de dados
export const salvarFonteDadosConfig = (config: FonteDadosConfig): void => {
  try {
    // Em uma implementação real, aqui enviaríamos para uma API ou Supabase
    // Para fins de demonstração, salvamos no localStorage
    const configsAtuais = obterTodasFontesDados();
    
    // Verificar se já existe uma config para este tipo
    const index = configsAtuais.findIndex(c => c.tipo === config.tipo);
    
    if (index >= 0) {
      configsAtuais[index] = config;
    } else {
      configsAtuais.push(config);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configsAtuais));
    
    console.log(`Configuração de fonte ${config.tipo} salva com sucesso`);
  } catch (error) {
    console.error("Erro ao salvar configuração:", error);
    toast({
      title: "Erro ao salvar configuração",
      description: "Não foi possível salvar a configuração da fonte de dados",
      variant: "destructive"
    });
  }
};

export const obterConfigPorTipo = (tipo: string): FonteDadosConfig | undefined => {
  try {
    const configs = obterTodasFontesDados();
    return configs.find(c => c.tipo === tipo);
  } catch (error) {
    console.error(`Erro ao buscar configuração para ${tipo}:`, error);
    return undefined;
  }
};

export const obterTodasFontesDados = (): FonteDadosConfig[] => {
  try {
    const configsStr = localStorage.getItem(STORAGE_KEY);
    return configsStr ? JSON.parse(configsStr) : [];
  } catch (error) {
    console.error("Erro ao obter configurações:", error);
    return [];
  }
};

export const removerFonteDadosConfig = (tipo: string): void => {
  try {
    const configs = obterTodasFontesDados();
    const novasConfigs = configs.filter(c => c.tipo !== tipo);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novasConfigs));
  } catch (error) {
    console.error(`Erro ao remover configuração para ${tipo}:`, error);
  }
};

// Funções para testes de conexão com as fontes de dados
export const testarConexaoFonteDados = async (config: FonteDadosConfig): Promise<boolean> => {
  // Simular uma chamada de API para testar a conexão
  console.log(`Testando conexão com fonte ${config.tipo}...`);
  
  return new Promise((resolve) => {
    // Simulação de tempo de processamento
    setTimeout(() => {
      // Simulação de sucesso ou falha com base na presença de credenciais
      const temCredenciais = Object.keys(config.credenciais || {}).length > 0;
      if (temCredenciais) {
        console.log(`Conexão com ${config.tipo} bem-sucedida`);
        toast({
          title: "Conexão bem-sucedida",
          description: `A conexão com ${config.tipo.toUpperCase()} foi estabelecida com sucesso`,
        });
        resolve(true);
      } else {
        console.error(`Falha na conexão com ${config.tipo}: credenciais ausentes ou inválidas`);
        toast({
          title: "Falha na conexão",
          description: "Não foi possível conectar com a fonte de dados. Verifique as credenciais.",
          variant: "destructive"
        });
        resolve(false);
      }
    }, 1500);
  });
};

// Funções para integração com o sistema de apuração
export const iniciarIngestaoAutomatica = async (tipo: string): Promise<void> => {
  const config = obterConfigPorTipo(tipo);
  
  if (!config) {
    toast({
      title: "Configuração não encontrada",
      description: `Não foi possível iniciar a ingestão: configuração para ${tipo} não encontrada`,
      variant: "destructive"
    });
    return;
  }
  
  // Em uma implementação real, aqui iniciaríamos o processo de ingestão
  // usando as credenciais e configurações do objeto config
  toast({
    title: "Ingestão iniciada",
    description: `Processo de ingestão automática para ${tipo} iniciado com sucesso`,
  });
  
  // Simular processamento
  setTimeout(() => {
    toast({
      title: "Ingestão concluída",
      description: `Dados de ${tipo} processados: 24 novos registros importados`,
    });
  }, 3000);
};
