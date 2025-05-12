
import React from 'react';
import { useSupabaseClient } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { Calendar, Filter } from "lucide-react";

interface PayrollFilterProps {
  selectedClientId: string | null;
  onClientSelect: (client: { id: string, name: string }) => void;
  period: string;
  onPeriodChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onRefresh: () => void;
}

export function PayrollFilter({ 
  selectedClientId,
  onClientSelect, 
  period, 
  onPeriodChange,
  onRefresh
}: PayrollFilterProps) {
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  
  const generatePeriodOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Generate options for the current year and the previous year
    for (let year = currentYear; year >= currentYear - 1; year--) {
      const maxMonth = year === currentYear ? currentMonth : 12;
      
      for (let month = maxMonth; month >= 1; month--) {
        const monthStr = String(month).padStart(2, '0');
        const periodValue = `${year}-${monthStr}`;
        const periodLabel = formatPeriod(periodValue);
        
        options.push(
          <option key={periodValue} value={periodValue}>
            {periodLabel}
          </option>
        );
      }
    }
    
    return options;
  };
  
  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-end">
      <div className="w-full md:w-1/3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
        <ClientSelector onClientSelect={onClientSelect} />
      </div>
      
      <div className="w-full md:w-1/3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <select
            value={period}
            onChange={onPeriodChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generatePeriodOptions()}
          </select>
        </div>
      </div>
      
      <div className="w-full md:w-1/3">
        <Button variant="outline" onClick={onRefresh} className="w-full">
          <Filter className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
      </div>
    </div>
  );
}
