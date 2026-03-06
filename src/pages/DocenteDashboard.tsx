import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, FileText, PlusCircle, BarChart3, FolderOpen, ArrowLeft, ClipboardList, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CursosManager } from '@/components/CursosManager';
import { EstudiantesManager } from '@/components/EstudiantesManager';
import { ValoracionesCoordinadorManager } from '@/components/ValoracionesCoordinadorManager';
import { EstadisticasManager } from '@/components/EstadisticasManager';
import { SeguimientoTiempoReal } from '@/components/SeguimientoTiempoReal';
import { ActasEstudiantesViewer } from '@/components/ActasEstudiantesViewer';

const DocenteDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Panel General</TabsTrigger>
              <TabsTrigger value="seguimiento">Seguimiento en Tiempo Real</TabsTrigger>
              <TabsTrigger value="cursos">Mis CAI - Encuentros dialógicos</TabsTrigger>
              <TabsTrigger value="estudiantes">Estudiantes</TabsTrigger>
              <TabsTrigger value="evaluaciones">Valoraciones</TabsTrigger>
              <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
              <TabsTrigger value="actas">Actas</TabsTrigger>
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
                        <CardTitle>Valoraciones</CardTitle>
                        <CardDescription>Revisar diagnósticos</CardDescription>
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
                  <CardTitle>Valoraciones Recientes</CardTitle>
                  <CardDescription>Últimos diagnósticos completados por estudiantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ValoracionesCoordinadorManager showRecent={true} />
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
              <ValoracionesCoordinadorManager showRecent={false} />
            </TabsContent>

            <TabsContent value="estadisticas">
              <EstadisticasManager />
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Plan de Mejoramiento
                  </CardTitle>
                  <CardDescription>
                    Completa el formulario de plan de mejoramiento institucional
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => window.open('https://forms.office.com/Pages/ResponsePage.aspx?id=oGfaB0MfjE6Xf1-ItkcO5i11o9mVt19AhoOf5jnhkOhUQ0tQUUZWWUE4TU5NVDFSQkZTUEFYMDNTTy4u', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Formulario Plan de Mejoramiento
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actas">
              <ActasEstudiantesViewer />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DocenteDashboard;
