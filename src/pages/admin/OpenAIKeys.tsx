
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { OpenAIManagement } from '@/components/admin/openai/OpenAIManagement';

const OpenAIKeys = () => {
  return (
    <DashboardLayout>
      <OpenAIManagement />
    </DashboardLayout>
  );
};

export default OpenAIKeys;
