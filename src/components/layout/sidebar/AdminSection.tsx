
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Users, 
  BarChart, 
  Settings, 
  Mail, 
  CreditCard,
  AlertTriangle,
  Activity,
  Shield,
  CheckCircle2,
  Bot
} from 'lucide-react';

export function AdminSection() {
  const location = useLocation();

  const adminItems = [
    {
      title: "Gestão de Contabilidades",
      href: "/admin/customer-management",
      icon: Users,
    },
    {
      title: "Análises de Negócio",
      href: "/admin/business-analytics",
      icon: BarChart,
    },
    {
      title: "Métricas de Uso",
      href: "/admin/usage-metrics",
      icon: Settings,
    },
    {
      title: "Convites de Usuário",
      href: "/user-management",
      icon: Mail,
    },
    {
      title: "Alertas de Pagamento",
      href: "/admin/payment-alerts",
      icon: AlertTriangle,
    },
    {
      title: "Gestão OpenAI",
      href: "/admin/openai-management",
      icon: CreditCard,
    },
    {
      title: "Dashboard de Automação",
      href: "/admin/automation",
      icon: Activity,
    },
    {
      title: "Motor de Automação",
      href: "/admin/task-automation",
      icon: Bot,
    },
    {
      title: "Segurança",
      href: "/admin/security",
      icon: Shield,
    },
    {
      title: "Status do Sistema",
      href: "/admin/system-status",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-1">
      <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Administração
      </h3>
      {adminItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
            location.pathname === item.href
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )}
        >
          <item.icon className="mr-3 h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </div>
  );
}
