
import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Zap } from "lucide-react";

interface LimiarConfiancaSliderProps {
  limiarConfianca: number;
  onChange: (value: number) => void;
}

export function LimiarConfiancaSlider({ limiarConfianca, onChange }: LimiarConfiancaSliderProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <Label>Limiar de Confiança ({Math.round(limiarConfianca * 100)}%)</Label>
        <Zap className="h-4 w-4 text-muted-foreground" />
      </div>
      <Slider
        value={[limiarConfianca * 100]}
        min={50}
        max={99}
        step={1}
        onValueChange={(value) => onChange(value[0] / 100)}
        className="py-4"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>50%</span>
        <span>75%</span>
        <span>99%</span>
      </div>
    </div>
  );
}
