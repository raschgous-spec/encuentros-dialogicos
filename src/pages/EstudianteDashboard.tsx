import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DiagnosticoMomento } from '@/components/moments/DiagnosticoMomento';
import { NivelatorioMomento } from '@/components/moments/NivelatorioMomento';
import { Encuentro1Momento } from '@/components/moments/Encuentro1Momento';
import { Encuentro2Momento } from '@/components/moments/Encuentro2Momento';
import { Encuentro3Momento } from '@/components/moments/Encuentro3Momento';
import { Encuentro4Momento } from '@/components/moments/Encuentro4Momento';
import { PortafolioMomento } from '@/components/moments/PortafolioMomento';
import { PADMomento } from '@/components/moments/PADMomento';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EstudianteDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pad');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleMomentoComplete = async (momento: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('momento_progreso')
        .upsert({
          estudiante_id: user.id,
          momento,
          completado: true,
          fecha_completado: new Date().toISOString(),
        }, {
          onConflict: 'estudiante_id,momento'
        });

      if (error) throw error;

      // Open satisfaction survey for encuentros 1-4
      const encuentroMomentos = ['encuentro1', 'encuentro2', 'encuentro3', 'encuentro4'];
      if (encuentroMomentos.includes(momento)) {
        window.open('https://forms.office.com/Pages/ResponsePage.aspx?id=oGfaB0MfjE6Xf1-ItkcO5i11o9mVt19AhoOf5jnhkOhUQ0tQUUZWWUE4TU5NVDFSQkZTUEFYMDNTTy4u', '_blank');
      }
    } catch (error) {
      console.error('Error updating momento progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">MI CAMPO DE APRENDIZAJE</h1>
          <p className="text-muted-foreground">
            Avanza a través de los momentos de aprendizaje
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            <TabsTrigger value="pad" className="flex flex-col items-center gap-1 justify-center py-3">
              <span className="font-semibold text-xs text-center">PAD</span>
            </TabsTrigger>
            <TabsTrigger value="diagnostico" className="flex flex-col items-center gap-1 justify-center py-3">
              <span className="font-semibold text-xs text-center">DIAGNÓSTICO</span>
            </TabsTrigger>
            <TabsTrigger value="nivelatorio" className="flex flex-col items-center gap-1 justify-center py-3">
              <span className="font-semibold text-xs text-center">NIVELATORIO</span>
            </TabsTrigger>
            <TabsTrigger value="encuentro1" className="flex flex-col items-center gap-1 justify-center py-3">
              <span className="font-semibold text-xs text-center">ENCUENTRO 1</span>
            </TabsTrigger>
            <TabsTrigger value="encuentro2" className="flex flex-col items-center gap-1 justify-center py-3">
              <span className="font-semibold text-xs text-center">ENCUENTRO 2</span>
            </TabsTrigger>
            <TabsTrigger value="encuentro3" className="flex flex-col items-center gap-1 justify-center py-3">
              <span className="font-semibold text-xs text-center">ENCUENTRO 3</span>
            </TabsTrigger>
            <TabsTrigger value="encuentro4" className="flex flex-col items-center gap-1 justify-center py-3">
              <span className="font-semibold text-xs text-center">ENCUENTRO 4</span>
            </TabsTrigger>
            <TabsTrigger value="portafolio" className="flex flex-col items-center gap-1 justify-center py-3">
              <span className="font-semibold text-xs text-center">MI ESPACIO DE APRENDIZAJE</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pad" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>PLAN DE APRENDIZAJE DIGITAL (PAD)</CardTitle>
                <CardDescription>
                  Encuentra aquí toda la información sobre el Plan de Aprendizaje Digital CAI - Encuentros Dialógicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PADMomento />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diagnostico" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>MOMENTO 1 - DIAGNÓSTICO</CardTitle>
                <CardDescription>
                  Completa el diagnóstico inicial para evaluar tus conocimientos sobre herramientas de calidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DiagnosticoMomento 
                  onComplete={() => handleMomentoComplete('diagnostico')} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nivelatorio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>MOMENTO 2 - NIVELATORIO</CardTitle>
                <CardDescription>
                  Material de refuerzo y actividades de nivelación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NivelatorioMomento onComplete={() => handleMomentoComplete('nivelatorio')} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="encuentro1" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>MOMENTO 3 - ENCUENTRO 1</CardTitle>
                <CardDescription>
                  Primer encuentro dialógico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Encuentro1Momento 
                  onComplete={() => handleMomentoComplete('encuentro1')} 
                  isLocked={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="encuentro2" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>MOMENTO 4 - ENCUENTRO 2</CardTitle>
                <CardDescription>
                  Segundo encuentro dialógico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Encuentro2Momento 
                  onComplete={() => handleMomentoComplete('encuentro2')} 
                  isLocked={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="encuentro3" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>MOMENTO 5 - ENCUENTRO 3</CardTitle>
                <CardDescription>
                  Tercer encuentro dialógico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Encuentro3Momento 
                  onComplete={() => handleMomentoComplete('encuentro3')} 
                  isLocked={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="encuentro4" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>MOMENTO 6 - ENCUENTRO 4</CardTitle>
                <CardDescription>
                  Cuarto encuentro dialógico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Encuentro4Momento 
                  onComplete={() => handleMomentoComplete('encuentro4')} 
                  isLocked={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portafolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>MI ESPACIO DE APRENDIZAJE</CardTitle>
                <CardDescription>
                  Resumen completo de tus valoraciones, actas y planes de mejoramiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PortafolioMomento />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EstudianteDashboard;
