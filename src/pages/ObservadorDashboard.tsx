import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, BookOpen, BarChart3, FileText, ArrowLeft, GraduationCap, UserCog } from 'lucide-react';
import { EstudiantesManager } from '@/components/EstudiantesManager';
import { EvaluacionesManager } from '@/components/EvaluacionesManager';
import { EstadisticasManager } from '@/components/EstadisticasManager';
import { SeguimientoTiempoReal } from '@/components/SeguimientoTiempoReal';
import { CursosManager } from '@/components/CursosManager';

const ObservadorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <Badge variant="secondary" className="gap-1 px-3 py-1">
              <Eye className="w-3 h-3" />
              Modo Observación — Solo lectura
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="flex flex-wrap gap-1">
              <TabsTrigger value="overview">Panel General</TabsTrigger>
              <TabsTrigger value="seguimiento">Seguimiento en Tiempo Real</TabsTrigger>
              <TabsTrigger value="cursos">CAI - Encuentros dialógicos</TabsTrigger>
              <TabsTrigger value="estudiantes">Estudiantes</TabsTrigger>
              <TabsTrigger value="evaluaciones">Valoraciones</TabsTrigger>
              <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Panel del Observador Administrativo</h1>
                <p className="text-muted-foreground">
                  Visualización completa de la plataforma — estudiantes, coordinadores y progreso académico
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Seguimiento en Tiempo Real</CardTitle>
                        <CardDescription>Monitorea el progreso de los estudiantes</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => setActiveTab('seguimiento')}>
                      Ver Seguimiento
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
                        <CardTitle>CAI - Encuentros dialógicos</CardTitle>
                        <CardDescription>Ver cursos y contenido registrado</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => setActiveTab('cursos')}>
                      Ver Cursos
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Estudiantes</CardTitle>
                        <CardDescription>Ver listado y estado de estudiantes</CardDescription>
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
                        <CardTitle>Valoraciones</CardTitle>
                        <CardDescription>Revisar diagnósticos completados</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => setActiveTab('evaluaciones')}>
                      Ver Valoraciones
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
                        <CardDescription>Analítica del progreso académico</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => setActiveTab('estadisticas')}>
                      Ver Estadísticas
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-dashed opacity-60">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <UserCog className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-muted-foreground">Gestión de usuarios</CardTitle>
                        <CardDescription>No disponible en modo observación</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" disabled>
                      Sin acceso
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Eye className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Vista Estudiante</CardTitle>
                        <CardDescription>Ver la plataforma como un estudiante</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => navigate('/estudiante')}>
                      Acceder como Estudiante
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Valoraciones Recientes</CardTitle>
                  <CardDescription>Últimos diagnósticos completados por estudiantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <EvaluacionesManager showRecent={true} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seguimiento">
              <SeguimientoTiempoReal />
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

export default ObservadorDashboard;
