import React from 'react';
import { Bell, Search, User, ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useLocation } from 'react-router-dom';

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/clients': 'Clientes',
  '/documents': 'Documentos',
  '/accounting': 'Contabilidade',
  '/analytics': 'Analytics',
  '/closing': 'Fechamento',
  '/payments': 'Pagamentos',
  '/integrations': 'Integrações',
  '/automation': 'Automação',
  '/settings': 'Configurações',
  '/security': 'Segurança',
  '/support': 'Suporte',
};

export function AppHeader() {
  const location = useLocation();
  const currentPath = location.pathname;

  const generateBreadcrumbs = () => {
    const pathSegments = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Dashboard', path: '/' }];

    if (pathSegments.length > 0) {
      let currentPath = '';
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
        breadcrumbs.push({ label, path: currentPath });
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Sidebar Trigger */}
        <SidebarTrigger className="mr-2" />

        {/* Breadcrumbs */}
        <div className="flex-1">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage className="font-semibold">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink 
                        href={crumb.path}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Buscar..." 
              className="pl-10 w-64 bg-background/60"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/32/32" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">João Silva</p>
                  <p className="text-xs text-muted-foreground">Contador</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notificações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}