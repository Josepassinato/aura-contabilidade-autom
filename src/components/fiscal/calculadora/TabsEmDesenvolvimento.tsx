
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TabsEmDesenvolvimentoProps {
  title: string;
}

export const TabsEmDesenvolvimento: React.FC<TabsEmDesenvolvimentoProps> = ({ title }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Funcionalidade de {title.toLowerCase()} em desenvolvimento.
        </p>
      </CardContent>
    </Card>
  );
};
