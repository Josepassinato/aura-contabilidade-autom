import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { ValidationResult } from '../types/security';

interface ValidationResultsProps {
  results: ValidationResult[];
}

export function ValidationResults({ results }: ValidationResultsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados de Validação Recentes</CardTitle>
        <CardDescription>
          Últimas validações executadas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma validação executada recentemente</p>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={`${result.validation_id}-${index}`} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <h4 className="font-medium">{result.type.replace('_', ' ').toUpperCase()}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      result.status === 'passed' ? 'default' :
                      result.status === 'warning' ? 'secondary' : 'destructive'
                    }>
                      {result.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Score: {result.score}%
                    </span>
                  </div>
                </div>
                
                <Progress value={result.score} className="mb-2" />
                
                {result.recommendations.length > 0 && (
                  <div className="mt-2">
                    <h5 className="text-sm font-medium mb-1">Recomendações:</h5>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {result.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}