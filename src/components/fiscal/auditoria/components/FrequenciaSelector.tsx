
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioItem } from "@/components/ui/radio-group";
import { Clock } from "lucide-react";

interface FrequenciaSelectorProps {
  frequencia: string;
  onChange: (value: string) => void;
}

export function FrequenciaSelector({ frequencia, onChange }: FrequenciaSelectorProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <Label>Frequência de Verificação</Label>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </div>
      <RadioGroup 
        value={frequencia} 
        onValueChange={onChange}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioItem value="tempo-real" id="tempo-real" />
          <Label htmlFor="tempo-real">Tempo Real</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioItem value="diaria" id="diaria" />
          <Label htmlFor="diaria">Diária</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioItem value="semanal" id="semanal" />
          <Label htmlFor="semanal">Semanal</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
