import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, FileText, PlusCircle, BarChart3, FolderOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CursosManager } from '@/components/CursosManager';
import { EstudiantesManager } from '@/components/EstudiantesManager';
import { EvaluacionesManager } from '@/components/EvaluacionesManager';
import { EstadisticasManager } from '@/components/EstadisticasManager';

const DocenteDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Panel General</TabsTrigger>
              <TabsTrigger value="cursos">Mis Cursos</TabsTrigger>
              <TabsTrigger value="estudiantes">Estudiantes</TabsTrigger>
              <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
              <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Panel del Coordinador</h1>
                <p className="text-muted-foreground">
                  Gestiona contenido, estudiantes y supervisa el progreso académico
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <PlusCircle className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Crear Contenido</CardTitle>
                        <CardDescription>Agregar nuevos casos y ejercicios</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => setActiveTab('cursos')}>
                      Nuevo Contenido
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FolderOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Mi Contenido</CardTitle>
                        <CardDescription>Gestionar material creado</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => setActiveTab('cursos')}>
                      Ver Contenido
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Mis Estudiantes</CardTitle>
                        <CardDescription>Seguimiento de estudiantes</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => setActiveTab('estudiantes')}>
                      Ver Estudiantes
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Evaluaciones</CardTitle>
                        <CardDescription>Revisar diagnósticos</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => setActiveTab('evaluaciones')}>
                      Ver Evaluaciones
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Estadísticas</CardTitle>
                        <CardDescription>Progreso de los estudiantes</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => setActiveTab('estadisticas')}>
                      Ver Estadísticas
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Recursos</CardTitle>
                        <CardDescription>Material de apoyo</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => setActiveTab('cursos')}>
                      Ver Recursos
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Evaluaciones Recientes</CardTitle>
                  <CardDescription>Últimos diagnósticos completados por estudiantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <EvaluacionesManager showRecent={true} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cursos">
              <CursosManager />
            </TabsContent>

            <TabsContent value="estudiantes">
              <EstudiantesManager />
            </TabsContent>

            <TabsContent value="evaluaciones">
              <EvaluacionesManager showRecent={false} />
            </TabsContent>

            <TabsContent value="estadisticas">
              <EstadisticasManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DocenteDashboard;
