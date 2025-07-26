
import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({ title, value, icon, trend, className = "" }: MetricCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-body">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-display text-2xl font-semibold mb-1">{value}</div>
        {trend && (
          <div className="flex items-center text-xs">
            <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
              <span className="inline-block mr-1">
                {trend.isPositive ? '↑' : '↓'}
              </span>
              {Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground ml-1">vs. mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MetricCard;
