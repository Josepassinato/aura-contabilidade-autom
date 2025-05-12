
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, FileText, CheckCircle, AlertTriangle, Clock } from "lucide-react";

interface ObrigacoesSummaryCardsProps {
  pendentes: number;
  atrasadas: number;
  concluidas: number;
  proximaSemana: number;
}

export const ObrigacoesSummaryCards = ({
  pendentes = 0,
  atrasadas = 0,
  concluidas = 0,
  proximaSemana = 0
}: ObrigacoesSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Clock className="h-8 w-8 mb-2 text-yellow-500 mx-auto" />
            <h3 className="text-3xl font-bold">{pendentes}</h3>
            <p className="text-sm text-muted-foreground">
              Pendentes
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mb-2 text-red-500 mx-auto" />
            <h3 className="text-3xl font-bold">{atrasadas}</h3>
            <p className="text-sm text-muted-foreground">
              Atrasadas
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-8 w-8 mb-2 text-green-500 mx-auto" />
            <h3 className="text-3xl font-bold">{concluidas}</h3>
            <p className="text-sm text-muted-foreground">
              Concluídas
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Calendar className="h-8 w-8 mb-2 text-blue-500 mx-auto" />
            <h3 className="text-3xl font-bold">{proximaSemana}</h3>
            <p className="text-sm text-muted-foreground">
              Próximos 7 dias
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
