import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Star,
  TrendingUp,
  Target,
  Zap,
  Award
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  category: 'productivity' | 'compliance' | 'growth' | 'automation';
  points: number;
}

export function GamificationPanel() {
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Primeiro Balancete',
      description: 'Gere seu primeiro balancete no sistema',
      progress: 1,
      maxProgress: 1,
      completed: true,
      category: 'productivity',
      points: 100
    },
    {
      id: '2',
      title: 'Mestre da Conformidade',
      description: 'Complete 10 obrigações fiscais no prazo',
      progress: 7,
      maxProgress: 10,
      completed: false,
      category: 'compliance',
      points: 250
    },
    {
      id: '3',
      title: 'Automatizador',
      description: 'Configure 3 automações diferentes',
      progress: 2,
      maxProgress: 3,
      completed: false,
      category: 'automation',
      points: 300
    },
    {
      id: '4',
      title: 'Crescimento Consistente',
      description: 'Aumente a receita por 3 meses consecutivos',
      progress: 2,
      maxProgress: 3,
      completed: false,
      category: 'growth',
      points: 500
    }
  ];

  const totalPoints = achievements
    .filter(a => a.completed)
    .reduce((sum, a) => sum + a.points, 0);

  const currentLevel = Math.floor(totalPoints / 1000) + 1;
  const pointsToNextLevel = (currentLevel * 1000) - totalPoints;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity':
        return <Zap className="h-4 w-4" />;
      case 'compliance':
        return <CheckCircle className="h-4 w-4" />;
      case 'growth':
        return <TrendingUp className="h-4 w-4" />;
      case 'automation':
        return <Target className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productivity':
        return 'text-yellow-600 bg-yellow-100';
      case 'compliance':
        return 'text-green-600 bg-green-100';
      case 'growth':
        return 'text-blue-600 bg-blue-100';
      case 'automation':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sistema de Conquistas</h2>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e conquiste novos marcos
          </p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nível Atual</p>
                <p className="text-2xl font-bold">{currentLevel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pontos Totais</p>
                <p className="text-2xl font-bold">{totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conquistas</p>
                <p className="text-2xl font-bold">
                  {achievements.filter(a => a.completed).length}/{achievements.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Next Level */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso para o Próximo Nível</CardTitle>
          <CardDescription>
            Faltam {pointsToNextLevel} pontos para o nível {currentLevel + 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress 
            value={(totalPoints % 1000) / 10} 
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Achievements */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
          <TabsTrigger value="progress">Em Progresso</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.completed ? 'border-green-200' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${getCategoryColor(achievement.category)}`}>
                          {getCategoryIcon(achievement.category)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-2"
                          />
                        </div>
                        <Badge variant={achievement.completed ? 'default' : 'outline'}>
                          {achievement.points} pts
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {achievement.completed ? (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      ) : (
                        <Clock className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {achievements.filter(a => a.completed).map((achievement) => (
              <Card key={achievement.id} className="border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(achievement.category)}`}>
                        {getCategoryIcon(achievement.category)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>+{achievement.points} pts</Badge>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4">
            {achievements.filter(a => !a.completed).map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${getCategoryColor(achievement.category)}`}>
                          {getCategoryIcon(achievement.category)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-2"
                          />
                        </div>
                        <Badge variant="outline">
                          {achievement.points} pts
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}