
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
  Briefcase 
} from "lucide-react";
import { Sidebar } from "../ui/sidebar";
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";

const DashboardSidebar = () => {
  const { isAccountant, isAdmin } = useAuth();

  // Somente accountants e admins podem ver essas seções
  const isAccountantOrAdmin = isAccountant || isAdmin;

  return (
    <Sidebar className="border-r bg-background h-full fixed left-0 top-0 bottom-0 w-64">
      <Sidebar.Section className="flex items-center h-14 px-4 border-b">
        <div className="flex items-center space-x-2">
          <Building className="h-6 w-6" />
          <span className="font-semibold">Contábil App</span>
        </div>
      </Sidebar.Section>

      <Sidebar.Section className="p-2 flex-1 overflow-auto">
        <Sidebar.Nav>
          <Sidebar.NavLink asChild className="hover:bg-accent">
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
          </Sidebar.NavLink>

          {isAccountantOrAdmin && (
            <>
              <Sidebar.NavLink asChild className="hover:bg-accent">
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
              </Sidebar.NavLink>

              <Sidebar.NavLink asChild className="hover:bg-accent">
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
              </Sidebar.NavLink>

              <Sidebar.NavLink asChild className="hover:bg-accent">
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
              </Sidebar.NavLink>

              <Sidebar.NavLink asChild className="hover:bg-accent">
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
              </Sidebar.NavLink>

              {/* Novas seções */}
              <Sidebar.NavLink asChild className="hover:bg-accent">
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
              </Sidebar.NavLink>

              <Sidebar.NavLink asChild className="hover:bg-accent">
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
              </Sidebar.NavLink>
            </>
          )}

          <Sidebar.NavLink asChild className="hover:bg-accent">
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
          </Sidebar.NavLink>

          {isAccountantOrAdmin && (
            <Sidebar.NavLink asChild className="hover:bg-accent">
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
            </Sidebar.NavLink>
          )}
        </Sidebar.Nav>
      </Sidebar.Section>

      <Sidebar.Section className="p-2">
        <Sidebar.Nav>
          <Sidebar.NavLink asChild className="hover:bg-accent">
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
          </Sidebar.NavLink>
        </Sidebar.Nav>
      </Sidebar.Section>
    </Sidebar>
  );
};

export default DashboardSidebar;
