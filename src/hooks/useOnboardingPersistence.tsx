import { useState, useEffect } from 'react';

interface OnboardingData {
  currentStep: number;
  officeData: any;
  primeiroClienteData: any;
  fiscalData: any;
  bancariaData: any;
  equipeData: any;
  timestamp: number;
}

const STORAGE_KEY = 'contaflow-onboarding-progress';
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas

export function useOnboardingPersistence() {
  const [data, setData] = useState<OnboardingData>({
    currentStep: 0,
    officeData: null,
    primeiroClienteData: null,
    fiscalData: null,
    bancariaData: null,
    equipeData: null,
    timestamp: Date.now()
  });

  // Carregar dados salvos ao inicializar
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData) as OnboardingData;
        
        // Verificar se os dados não expiraram
        if (Date.now() - parsed.timestamp < STORAGE_EXPIRY) {
          setData(parsed);
        } else {
          // Dados expirados, limpar
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar progresso do onboarding:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Salvar dados automaticamente quando mudarem
  useEffect(() => {
    try {
      const dataToSave = {
        ...data,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Erro ao salvar progresso do onboarding:', error);
    }
  }, [data]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const clearData = () => {
    setData({
      currentStep: 0,
      officeData: null,
      primeiroClienteData: null,
      fiscalData: null,
      bancariaData: null,
      equipeData: null,
      timestamp: Date.now()
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasProgress = () => {
    return data.currentStep > 0 || 
           data.officeData || 
           data.primeiroClienteData || 
           data.fiscalData || 
           data.bancariaData || 
           data.equipeData;
  };

  return {
    data,
    updateData,
    clearData,
    hasProgress
  };
}