import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DiagnosticoMomento } from '@/components/moments/DiagnosticoMomento';
import { NivelatorioMomento } from '@/components/moments/NivelatorioMomento';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Lock } from 'lucide-react';

const EstudianteDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('diagnostico');
  const [diagnosticoCompleted, setDiagnosticoCompleted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const checkDiagnosticoStatus = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('evaluaciones')
          .select('id')
          .eq('estudiante_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setDiagnosticoCompleted(!!data);
      } catch (error) {
        console.error('Error checking diagnostico status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkDiagnosticoStatus();
  }, [user]);

  if (loading || checkingStatus) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mi Espacio de Aprendizaje</h1>
          <p className="text-muted-foreground">
            Avanza a través de los momentos de aprendizaje
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="diagnostico" className="flex items-center gap-2">
              {diagnosticoCompleted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              MOMENTO 1
            </TabsTrigger>
            <TabsTrigger 
              value="nivelatorio" 
              disabled={!diagnosticoCompleted}
              className="flex items-center gap-2"
            >
              {!diagnosticoCompleted && <Lock className="h-4 w-4" />}
              MOMENTO 2
            </TabsTrigger>
          </TabsList>

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
                  onComplete={() => setDiagnosticoCompleted(true)} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nivelatorio" className="space-y-6">
            {!diagnosticoCompleted ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    MOMENTO 2 - NIVELATORIO
                  </CardTitle>
                  <CardDescription>
                    Debes completar el diagnóstico (Momento 1) antes de acceder al nivelatorio
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>MOMENTO 2 - NIVELATORIO</CardTitle>
                  <CardDescription>
                    Material de refuerzo y actividades de nivelación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NivelatorioMomento />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EstudianteDashboard;
