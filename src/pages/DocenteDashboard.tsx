import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, FileText, PlusCircle, BarChart3, FolderOpen } from 'lucide-react';

const DocenteDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Panel del Gestor del Conocimiento</h1>
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
                <Button className="w-full">Nuevo Contenido</Button>
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
                <Button className="w-full">Ver Contenido</Button>
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
                <Button className="w-full">Ver Estudiantes</Button>
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
                <Button className="w-full">Ver Evaluaciones</Button>
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
                <Button className="w-full">Ver Estadísticas</Button>
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
                <Button className="w-full">Ver Recursos</Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Evaluaciones Recientes</CardTitle>
              <CardDescription>Últimos diagnósticos completados por estudiantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Juan Pérez - Diagnóstico Completo</p>
                    <p className="text-sm text-muted-foreground">Completado hace 10 minutos</p>
                  </div>
                  <Button variant="outline" size="sm">Revisar</Button>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">María García - Diagnóstico Completo</p>
                    <p className="text-sm text-muted-foreground">Completado hace 1 hora</p>
                  </div>
                  <Button variant="outline" size="sm">Revisar</Button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Carlos López - Diagnóstico Completo</p>
                    <p className="text-sm text-muted-foreground">Completado hace 2 horas</p>
                  </div>
                  <Button variant="outline" size="sm">Revisar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocenteDashboard;
