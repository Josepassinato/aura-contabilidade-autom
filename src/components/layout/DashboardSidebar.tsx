
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  Users, 
  CalendarClock, 
  Receipt, 
  FileText, 
  BarChart3, 
  Calculator, 
  Settings,
  Building,
  PiggyBank,
  Landmark,
  Briefcase,
  Brain
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  isVoiceActive?: boolean;
  toggleVoiceAssistant?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = () => {
  const { isAccountant, isAdmin } = useAuth();

  // Somente accountants e admins podem ver essas seções
  const isAccountantOrAdmin = isAccountant || isAdmin;

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center h-14 px-4 border-b">
        <div className="flex items-center space-x-2">
          <Building className="h-6 w-6" />
          <span className="font-semibold">Contábil App</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 flex-1 overflow-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                    isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <PiggyBank className="h-5 w-5" />
                <span>Dashboard</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {isAccountantOrAdmin && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/clientes"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                        isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
                      )
                    }
                  >
                    <Users className="h-5 w-5" />
                    <span>Clientes</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/obrigacoes"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                        isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
                      )
                    }
                  >
                    <CalendarClock className="h-5 w-5" />
                    <span>Obrigações Fiscais</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/guias-fiscais"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                        isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
                      )
                    }
                  >
                    <Receipt className="h-5 w-5" />
                    <span>Guias Fiscais</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/folha-pagamento"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                        isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
                      )
                    }
                  >
                    <Briefcase className="h-5 w-5" />
                    <span>Folha de Pagamento</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Novas seções */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/calculos-fiscais"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                        isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
                      )
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
                    to="/automacao-bancaria"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                        isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
                      )
                    }
                  >
                    <Landmark className="h-5 w-5" />
                    <span>Automação Bancária</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Nova seção de Análises Preditivas com IA */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/analises-preditivas"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                        isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
                      )
                    }
                  >
                    <Brain className="h-5 w-5" />
                    <span>Análises Preditivas</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/relatorios-financeiros"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                    isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <BarChart3 className="h-5 w-5" />
                <span>Relatórios Financeiros</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {isAccountantOrAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/apuracao-automatica"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                      isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  <FileText className="h-5 w-5" />
                  <span>Apuração Automática</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                    isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
