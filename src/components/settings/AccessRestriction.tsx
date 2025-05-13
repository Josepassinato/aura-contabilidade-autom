
import React from "react";

export function AccessRestriction() {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
      <h2 className="text-xl font-medium">Acesso Restrito</h2>
      <p className="text-muted-foreground">
        Esta página é restrita a administradores do sistema.
      </p>
    </div>
  );
}
