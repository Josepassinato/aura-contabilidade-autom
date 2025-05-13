
import React from "react";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  FileText, 
  FolderOpen, 
  Clock, 
  Building2, 
  Users, 
  Key
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function CommonSection() {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Dashboard">
          <Link to="/">
            <BarChart3 />
            <span>Dashboard</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Obrigações Fiscais">
          <Link to="/obrigacoes-fiscais">
            <Clock />
            <span>Obrigações Fiscais</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Guias Fiscais">
          <Link to="/guias-fiscais">
            <FileText />
            <span>Guias Fiscais</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Gerenciar Clientes">
          <Link to="/gerenciar-clientes">
            <Building2 />
            <span>Gerenciar Clientes</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Colaboradores">
          <Link to="/colaboradores">
            <Users />
            <span>Colaboradores</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Acesso de Clientes">
          <Link to="/client-access">
            <Key />
            <span>Acesso de Clientes</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Documentos">
          <Link to="/documentos">
            <FolderOpen />
            <span>Documentos</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}
