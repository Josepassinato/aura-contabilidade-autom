import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Activity } from 'lucide-react';

export interface SystemStatus {
  component: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  details?: any;
}

interface SystemStatusGridProps {
  systemStatus: SystemStatus[];
}

export function SystemStatusGrid({ systemStatus }: SystemStatusGridProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {systemStatus.map((check, index) => (
        <Card key={index} className={`border ${getStatusColor(check.status)}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                {getStatusIcon(check.status)}
                {check.component}
              </span>
              <Badge variant={
                check.status === 'ok' ? 'default' :
                check.status === 'warning' ? 'secondary' : 'destructive'
              }>
                {check.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm">{check.message}</p>
            {check.details && (
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer">
                  Ver detalhes
                </summary>
                <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto max-h-20">
                  {JSON.stringify(check.details, null, 2)}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}