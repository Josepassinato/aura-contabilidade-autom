
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AuditoriaDashboard } from "@/components/fiscal/auditoria/AuditoriaDashboard";

const AuditoriaContinua = () => {
  return (
    <DashboardLayout>
      <AuditoriaDashboard />
    </DashboardLayout>
  );
};

export default AuditoriaContinua;
