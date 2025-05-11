
import React from "react";
import { ClientAccessForm } from "@/components/client-access/ClientAccessForm";
import { ClientAccessLayout } from "@/components/client-access/ClientAccessLayout";

const ClientAccess = () => {
  return (
    <ClientAccessLayout>
      <ClientAccessForm />
    </ClientAccessLayout>
  );
};

export default ClientAccess;
