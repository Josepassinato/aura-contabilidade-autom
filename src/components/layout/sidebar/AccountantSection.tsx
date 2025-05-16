import React from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, FileCog, FileCheck, FileText, 
  CalendarClock, Receipt, Network, Building2, Mail, 
  Database, Users, FileBarChart2, BarChart4, UserCog,
  Brain, FileStack, CreditCard, Building, Bell
} from "lucide-react";

import { Button } from "@/components/ui/button";

export function AccountantSection() {
  return (
    <div className="space-y-1">
      <Link to="/">
        <Button variant="ghost" className="w-full justify-start">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      </Link>
      
      <Link to="/clientes">
        <Button variant="ghost" className="w-full justify-start">
          <Building2 className="mr-2 h-4 w-4" />
          Clientes
        </Button>
      </Link>
      
      <Link to="/documentos">
        <Button variant="ghost" className="w-full justify-start">
          <FileStack className="mr-2 h-4 w-4" />
          Documentos
        </Button>
      </Link>
      
      <Link to="/client-access">
        <Button variant="ghost" className="w-full justify-start">
          <UserCog className="mr-2 h-4 w-4" />
          Acesso de Clientes
        </Button>
      </Link>

      {/* Fiscal */}
      <div className="pt-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Fiscal
        </h2>
        <div className="space-y-1">
          <Link to="/calculos-fiscais">
            <Button variant="ghost" className="w-full justify-start">
              <FileCog className="mr-2 h-4 w-4" />
              Cálculos Fiscais
            </Button>
          </Link>
          
          <Link to="/obrigacoes-fiscais">
            <Button variant="ghost" className="w-full justify-start">
              <CalendarClock className="mr-2 h-4 w-4" />
              Obrigações Fiscais
            </Button>
          </Link>
          
          <Link to="/guias-fiscais">
            <Button variant="ghost" className="w-full justify-start">
              <Receipt className="mr-2 h-4 w-4" />
              Guias Fiscais
            </Button>
          </Link>
          
          <Link to="/regime-fiscal">
            <Button variant="ghost" className="w-full justify-start">
              <FileCheck className="mr-2 h-4 w-4" />
              Regime Fiscal
            </Button>
          </Link>
          
          <Link to="/classificacao-reconciliacao">
            <Button variant="ghost" className="w-full justify-start bg-slate-100">
              <Brain className="mr-2 h-4 w-4" />
              Classificação ML
            </Button>
          </Link>
        </div>
      </div>

      {/* Integrações */}
      <div className="pt-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Integrações
        </h2>
        <div className="space-y-1">
          <Link to="/integracoes-gov">
            <Button variant="ghost" className="w-full justify-start">
              <Network className="mr-2 h-4 w-4" />
              Integrações Gov
            </Button>
          </Link>
          
          <Link to="/integracoes-estaduais">
            <Button variant="ghost" className="w-full justify-start">
              <Database className="mr-2 h-4 w-4" />
              Integrações Estaduais
            </Button>
          </Link>
        </div>
      </div>

      {/* Bancário */}
      <div className="pt-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Bancário
        </h2>
        <div className="space-y-1">
          <Link to="/automacao-bancaria">
            <Button variant="ghost" className="w-full justify-start">
              <Building className="mr-2 h-4 w-4" />
              Automação Bancária
            </Button>
          </Link>
        </div>
      </div>

      {/* Relatórios */}
      <div className="pt-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Relatórios
        </h2>
        <div className="space-y-1">
          <Link to="/relatorios">
            <Button variant="ghost" className="w-full justify-start">
              <FileBarChart2 className="mr-2 h-4 w-4" />
              Relatórios Financeiros
            </Button>
          </Link>
          
          <Link to="/relatorios-ia">
            <Button variant="ghost" className="w-full justify-start">
              <Brain className="mr-2 h-4 w-4" />
              Relatórios com IA
            </Button>
          </Link>
          
          <Link to="/analises-preditivas">
            <Button variant="ghost" className="w-full justify-start">
              <BarChart4 className="mr-2 h-4 w-4" />
              Análises Preditivas
            </Button>
          </Link>
        </div>
      </div>

      {/* RH e Folha */}
      <div className="pt-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          RH e Folha
        </h2>
        <div className="space-y-1">
          <Link to="/folha-pagamento">
            <Button variant="ghost" className="w-full justify-start">
              <CreditCard className="mr-2 h-4 w-4" />
              Folha de Pagamento
            </Button>
          </Link>
          
          <Link to="/colaboradores">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Colaboradores
            </Button>
          </Link>
        </div>
      </div>

      {/* Extras */}
      <div className="pt-2">
        <div className="space-y-1">
          <Link to="/email-service">
            <Button variant="ghost" className="w-full justify-start">
              <Mail className="mr-2 h-4 w-4" />
              E-mail
            </Button>
          </Link>
          
          <Link to="/notifications">
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="mr-2 h-4 w-4" />
              Notificações
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
