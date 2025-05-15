
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calculator, Users, FileText, CreditCard, Calendar, BarChart2, Settings } from 'lucide-react';

export function AccountantSection() {
  const { pathname } = useLocation();
  
  return (
    <div className="space-y-1">
      <Link
        to="/gerenciar-clientes"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
          pathname === '/gerenciar-clientes' ? 'bg-muted font-medium text-primary' : 'text-muted-foreground'
        }`}
      >
        <Users className="h-4 w-4" />
        <span>Clientes</span>
      </Link>
      <Link
        to="/client-access"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
          pathname === '/client-access' ? 'bg-muted font-medium text-primary' : 'text-muted-foreground'
        }`}
      >
        <CreditCard className="h-4 w-4" />
        <span>Portal do Cliente</span>
      </Link>
      <Link
        to="/calculosfiscais"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
          pathname === '/calculosfiscais' ? 'bg-muted font-medium text-primary' : 'text-muted-foreground'
        }`}
      >
        <Calculator className="h-4 w-4" />
        <span>Cálculos Fiscais</span>
      </Link>
      <Link
        to="/obrigacoesfiscais"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
          pathname === '/obrigacoesfiscais' ? 'bg-muted font-medium text-primary' : 'text-muted-foreground'
        }`}
      >
        <Calendar className="h-4 w-4" />
        <span>Obrigações Fiscais</span>
      </Link>
      <Link
        to="/relatoriosfinanceiros"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
          pathname === '/relatoriosfinanceiros' ? 'bg-muted font-medium text-primary' : 'text-muted-foreground'
        }`}
      >
        <BarChart2 className="h-4 w-4" />
        <span>Relatórios</span>
      </Link>
      <Link
        to="/parametros-fiscais"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
          pathname === '/parametros-fiscais' ? 'bg-muted font-medium text-primary' : 'text-muted-foreground'
        }`}
      >
        <Settings className="h-4 w-4" />
        <span>Parâmetros Fiscais</span>
      </Link>
      <Link
        to="/automacao-bancaria"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
          pathname === '/automacao-bancaria' ? 'bg-muted font-medium text-primary' : 'text-muted-foreground'
        }`}
      >
        <CreditCard className="h-4 w-4" />
        <span>Automação Bancária</span>
      </Link>
      <Link
        to="/folha-pagamento"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
          pathname === '/folha-pagamento' ? 'bg-muted font-medium text-primary' : 'text-muted-foreground'
        }`}
      >
        <FileText className="h-4 w-4" />
        <span>Folha de Pagamento</span>
      </Link>
    </div>
  );
}
