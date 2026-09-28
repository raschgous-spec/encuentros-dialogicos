import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { NivelatorioMomento } from '@/components/moments/NivelatorioMomento';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const GestorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState('diagnostico');
  const [ultima, setUltima] = useState<any>(null);
  useEffect(() => {
    if (!user) return;
    (supabase as any).from('medit_sesiones').select('insignia,puntaje_global').eq('user_id', user.id)
      .not('finished_at', 'is', null).order('finished_at', { ascending: false }).limit(1).maybeSingle()
      .then(({ data }: any) => setUltima(data));
  }, [user]);

  const complete = async (momento: string) => {
    if (!user) return;
    const { error } = await supabase.from('momento_progreso').upsert(
      { estudiante_id: user.id, momento, completado: true, fecha_completado: new Date().toISOString() },
      { onConflict: 'estudiante_id,momento' }
    );
    if (error) toast({ title: 'No se pudo guardar el avance', variant: 'destructive' });
    else toast({ title: 'Avance guardado' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-primary mb-1">Gestor del Conocimiento y el Aprendizaje</h1>
          <p className="text-muted-foreground mb-6">Desarrolla tu Diagnóstico y tu Nivelatorio.</p>
          <Tabs value={tab} onValueChange={setTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
              <TabsTrigger value="nivelatorio">Nivelatorio</TabsTrigger>
            </TabsList>
            <TabsContent value="diagnostico">
              <Card>
                <CardHeader>
                  <CardTitle>DIAGNÓSTICO · Reto MEDIT: Expedición Investigativa</CardTitle>
                  <CardDescription>Asume el rol de Auditor Estratégico y resuelve las crisis del Buzón de Crisis aplicando el rigor científico.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="grid gap-3 md:grid-cols-3 text-sm">
                    <li className="rounded-lg border p-4"><b>Nivel 1 · El Enigma del Método</b><br/>Clasifica expedientes en laboratorios Cuantitativo, Cualitativo o Mixto.</li>
                    <li className="rounded-lg border p-4"><b>Nivel 2 · La Brújula del Proyecto</b><br/>Ordena las fases de la investigación en la secuencia correcta.</li>
                    <li className="rounded-lg border p-4"><b>Nivel 3 · El Simulador de Soluciones</b><br/>Elige el camino y la matriz (DOFA, Pareto, Ishikawa, Afinidad) para la solución.</li>
                  </ul>
                  <p className="text-sm text-muted-foreground">Cada caso tiene tiempo límite. Al terminar recibes una insignia (Investigador Táctico, Metodólogo o Estratega de Soluciones) que define tu ruta en el Nivelatorio.</p>
                  {ultima && <p className="text-sm">Tu último resultado: <b>{ultima.insignia}</b> · {Math.round(ultima.puntaje_global)} pts</p>}
                  <Button onClick={() => navigate('/reto-medit')}>{ultima ? 'Repetir el reto' : 'Iniciar el reto'}</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="nivelatorio">
              <Card>
                <CardHeader>
                  <CardTitle>NIVELATORIO</CardTitle>
                  <CardDescription>Material de refuerzo y actividades de nivelación</CardDescription>
                </CardHeader>
                <CardContent>
                  <NivelatorioMomento onComplete={() => complete('nivelatorio')} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GestorDashboard;
