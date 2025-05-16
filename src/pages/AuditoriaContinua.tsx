
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AuditoriaContinuaConfig } from "@/components/fiscal/auditoria/AuditoriaContinuaConfig";
import { AuditoriaDashboard } from "@/components/fiscal/auditoria/AuditoriaDashboard";

const AuditoriaContinua = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AuditoriaDashboard />
      </div>
    </DashboardLayout>
  );
};

export default AuditoriaContinua;
