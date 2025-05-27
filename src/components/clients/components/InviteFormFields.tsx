
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccountingClient } from "@/lib/supabase";

interface InviteFormFieldsProps {
  client: AccountingClient;
}

export function InviteFormFields({ client }: InviteFormFieldsProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Empresa</Label>
        <Input value={client.name} readOnly className="bg-gray-50" />
      </div>
      
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={client.email} readOnly className="bg-gray-50" />
      </div>
    </div>
  );
}
