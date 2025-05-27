
import React from 'react';
import { UserInvitations } from '@/components/admin/UserInvitations';
import DashboardLayout from '@/components/layout/DashboardLayout';

const UserManagement = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Convide novos usuários e gerencie permissões de acesso
          </p>
        </div>
        
        <UserInvitations />
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
