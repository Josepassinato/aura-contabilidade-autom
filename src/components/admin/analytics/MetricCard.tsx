
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  description?: string;
}

export function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  className = "",
  valuePrefix = "",
  valueSuffix = "",
  description
}: MetricCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {valuePrefix}{typeof value === 'number' ? value.toLocaleString() : value}{valueSuffix}
        </div>
        {trend && (
          <div className="flex items-center text-xs mt-1">
            <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
              <span className="inline-block mr-1">
                {trend.isPositive ? '↑' : '↓'}
              </span>
              {Math.abs(trend.value).toFixed(1)}%
            </span>
            <span className="text-muted-foreground ml-1">vs. mês anterior</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
