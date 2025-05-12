
import React from 'react';
import { formatPeriod } from '../hooks/usePayrollGenerator';

interface PayrollPeriodSelectorProps {
  period: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function PayrollPeriodSelector({ period, onChange }: PayrollPeriodSelectorProps) {
  // Generate period options for the select
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

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
      <select
        value={period}
        onChange={onChange}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {generatePeriodOptions()}
      </select>
    </div>
  );
}
