
import React from "react";
import { NavLink } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Calculator,
  Calendar,
  FileText,
  ArrowDownToLine,
  BarChart,
  Users,
  Building2,
  Database,
  PieChart,
  CreditCard,
  Settings,
  Box,
  Building,
  KeyRound,
  FileBarChart,
} from "lucide-react";

export function AccountantSection() {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Ferramentas Contábeis</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/obrigacoes-fiscais"
                  className={({ isActive }) =>
                    isActive ? "bg-secondary" : undefined
                  }
                >
                  <Calendar className="h-5 w-5" />
                  <span>Obrigações Fiscais</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/calculos-fiscais"
                  className={({ isActive }) =>
                    isActive ? "bg-secondary" : undefined
                  }
                >
                  <Calculator className="h-5 w-5" />
                  <span>Cálculos Fiscais</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/guias-fiscais"
                  className={({ isActive }) =>
                    isActive ? "bg-secondary" : undefined
                  }
                >
                  <FileText className="h-5 w-5" />
                  <span>Guias Fiscais</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/relatorios-financeiros"
                  className={({ isActive }) =>
                    isActive ? "bg-secondary" : undefined
                  }
                >
                  <BarChart className="h-5 w-5" />
                  <span>Relatórios Financeiros</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/relatorios-ia"
                  className={({ isActive }) =>
                    isActive ? "bg-secondary" : undefined
                  }
                >
                  <FileBarChart className="h-5 w-5" />
                  <span>Relatórios por IA</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/folha-pagamento"
                  className={({ isActive }) =>
                    isActive ? "bg-secondary" : undefined
                  }
                >
                  <ArrowDownToLine className="h-5 w-5" />
                  <span>Folha de Pagamento</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/regime-fiscal"
                  className={({ isActive }) =>
                    isActive ? "bg-secondary" : undefined
                  }
                >
                  <Box className="h-5 w-5" />
                  <span>Regime Fiscal</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Gestão</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/gerenciar-clientes"
                  className={({ isActive }) =>
                    isActive ? "bg-secondary" : undefined
                  }
                >
                  <Building className="h-5 w-5" />
                  <span>Clientes</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/colaboradores"
                  className={({ isActive }) =>
                    isActive ? "bg-secondary" : undefined
                  }
                >
                  <Users className="h-5 w-5" />
                  <span>Colaboradores</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/apuracao-automatica"
                  className={({ isActive }) =>
                    isActive ? "bg-secondary" : undefined
                  }
                >
                  <Database className="h-5 w-5" />
                  <span>Apuração Automática</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/integracoes-gov"
                  className={({ isActive }) =>
                    isActive ? "bg-secondary" : undefined
                  }
                >
                  <KeyRound className="h-5 w-5" />
                  <span>Integrações Gov</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Integrações</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/automacao-bancaria"
                  className={({ isActive }) =>
                    isActive ? "bg-secondary" : undefined
                  }
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Automação Bancária</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/analises-preditivas"
                  className={({ isActive }) =>
                    isActive ? "bg-secondary" : undefined
                  }
                >
                  <PieChart className="h-5 w-5" />
                  <span>Análises Preditivas</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
