import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Settings, BarChart3, FileText, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocentesManager } from '@/components/DocentesManager';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Panel General</TabsTrigger>
              <TabsTrigger value="docentes">Coordinadores</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Panel de Administrador</h1>
                <p className="text-muted-foreground">
                  Gestiona usuarios, contenido y configuración del sistema
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
                        <CardTitle>Gestión de Usuarios</CardTitle>
                        <CardDescription>Administrar estudiantes y docentes</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Ver Usuarios</Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Roles y Permisos</CardTitle>
                        <CardDescription>Configurar accesos del sistema</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Gestionar Roles</Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Contenido Académico</CardTitle>
                        <CardDescription>Gestionar casos y ejercicios</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Ver Contenido</Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Reportes y Estadísticas</CardTitle>
                        <CardDescription>Analítica del sistema</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Ver Reportes</Button>
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
                        <CardDescription>Revisar diagnósticos completados</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Ver Evaluaciones</Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Settings className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Configuración</CardTitle>
                        <CardDescription>Ajustes del sistema</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Configurar</Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Últimas acciones en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium">Nuevo estudiante registrado</p>
                        <p className="text-sm text-muted-foreground">Hace 5 minutos</p>
                      </div>
                      <Button variant="ghost" size="sm">Ver</Button>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium">Evaluación completada</p>
                        <p className="text-sm text-muted-foreground">Hace 15 minutos</p>
                      </div>
                      <Button variant="ghost" size="sm">Ver</Button>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">Docente agregó nuevo contenido</p>
                        <p className="text-sm text-muted-foreground">Hace 1 hora</p>
                      </div>
                      <Button variant="ghost" size="sm">Ver</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="docentes">
              <DocentesManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
