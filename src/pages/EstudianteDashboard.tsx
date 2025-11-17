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
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Lock, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const EstudianteDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('diagnostico');
  const [momentoProgress, setMomentoProgress] = useState<Record<string, boolean>>({
    diagnostico: true,
    nivelatorio: false,
    encuentro1: false,
    encuentro2: false,
    encuentro3: false,
    encuentro4: false,
  });
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [unlockCode, setUnlockCode] = useState('');
  const [momentoToUnlock, setMomentoToUnlock] = useState<string>('');
  const [unlockedWithCode, setUnlockedWithCode] = useState<Record<string, boolean>>({
    encuentro1: false,
    encuentro2: false,
    encuentro3: false,
    encuentro4: false,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Check if moments were unlocked with code in previous session
  useEffect(() => {
    const savedUnlocks = localStorage.getItem('momentos_unlocked');
    if (savedUnlocks) {
      try {
        const unlocks = JSON.parse(savedUnlocks);
        setUnlockedWithCode(unlocks);
      } catch (error) {
        console.error('Error parsing unlocked moments:', error);
      }
    }
  }, []);

  useEffect(() => {
    const checkMomentoProgress = async () => {
      if (!user) return;

      try {
        // Fetch all momento progress for the student
        const { data: progressData, error: progressError } = await supabase
          .from('momento_progreso')
          .select('momento, completado')
          .eq('estudiante_id', user.id);

        if (progressError) throw progressError;

        // Check if student passed the nivelatorio evaluation
        const { data: evalData } = await supabase
          .from('student_evaluations')
          .select('passed')
          .eq('user_id', user.id)
          .eq('momento', 'nivelatorio')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const nivelatorioPassedEvaluation = evalData?.passed || false;

        // Build progress map
        const progress: Record<string, boolean> = {
          diagnostico: true, // Always accessible
          nivelatorio: false,
          encuentro1: false,
          encuentro2: false,
          encuentro3: false,
          encuentro4: false,
        };

        if (progressData) {
          progressData.forEach((item) => {
            if (item.completado) {
              progress[item.momento] = true;
              
              // Special case: encuentro1 requires passing nivelatorio evaluation
              if (item.momento === 'nivelatorio') {
                progress['encuentro1'] = nivelatorioPassedEvaluation;
              } else if (item.momento !== 'encuentro1') {
                // For other moments, unlock next if current is completed
                const momentOrder = ['diagnostico', 'nivelatorio', 'encuentro1', 'encuentro2', 'encuentro3', 'encuentro4'];
                const currentIndex = momentOrder.indexOf(item.momento);
                if (currentIndex < momentOrder.length - 1) {
                  progress[momentOrder[currentIndex + 1]] = true;
                }
              }
            }
          });
        }

        setMomentoProgress(progress);
      } catch (error) {
        console.error('Error checking momento progress:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkMomentoProgress();
  }, [user]);

  const handleTabChange = (value: string) => {
    const isUnlocked = momentoProgress[value] || unlockedWithCode[value as keyof typeof unlockedWithCode];
    
    if (!isUnlocked && (value === 'encuentro1' || value === 'encuentro2' || value === 'encuentro3' || value === 'encuentro4')) {
      openUnlockDialog(value);
    } else {
      setActiveTab(value);
    }
  };

  const handleUnlockWithCode = () => {
    if (unlockCode.trim().toUpperCase() === 'MEDIT') {
      const newUnlocks = { ...unlockedWithCode, [momentoToUnlock]: true };
      setUnlockedWithCode(newUnlocks);
      localStorage.setItem('momentos_unlocked', JSON.stringify(newUnlocks));
      setShowUnlockDialog(false);
      setUnlockCode('');
      setActiveTab(momentoToUnlock);
      
      const momentoNames: Record<string, string> = {
        encuentro1: 'Momento 3 - Encuentro 1',
        encuentro2: 'Momento 4 - Encuentro 2',
        encuentro3: 'Momento 5 - Encuentro 3',
        encuentro4: 'Momento 6 - Encuentro 4',
      };
      
      toast({
        title: "Momento desbloqueado",
        description: `Acceso concedido al ${momentoNames[momentoToUnlock]}`,
      });
    } else {
      toast({
        title: "Código incorrecto",
        description: "Por favor, verifica el código e intenta nuevamente",
        variant: "destructive",
      });
    }
  };

  const openUnlockDialog = (momento: string) => {
    setMomentoToUnlock(momento);
    setShowUnlockDialog(true);
  };

  const handleMomentoComplete = async (momento: string) => {
    if (!user) return;

    try {
      // Insert or update progress
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

      // Update local state to unlock next moment
      const momentOrder = ['diagnostico', 'nivelatorio', 'encuentro1', 'encuentro2', 'encuentro3', 'encuentro4'];
      const currentIndex = momentOrder.indexOf(momento);
      
      setMomentoProgress((prev) => {
        const newProgress = { ...prev };
        newProgress[momento] = true;
        if (currentIndex < momentOrder.length - 1) {
          newProgress[momentOrder[currentIndex + 1]] = true;
        }
        return newProgress;
      });
    } catch (error) {
      console.error('Error updating momento progress:', error);
    }
  };

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

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <TabsTrigger value="diagnostico" className="flex flex-col items-center gap-1 justify-center py-3">
              <span className="font-semibold text-xs text-center">DIAGNÓSTICO</span>
            </TabsTrigger>
            <TabsTrigger 
              value="nivelatorio" 
              disabled={!momentoProgress.nivelatorio}
              className="flex flex-col items-center gap-1 justify-center py-3"
            >
              {!momentoProgress.nivelatorio && <Lock className="h-4 w-4" />}
              <span className="font-semibold text-xs text-center">NIVELATORIO</span>
            </TabsTrigger>
            <TabsTrigger 
              value="encuentro1" 
              className="flex flex-col items-center gap-1 justify-center py-3 relative"
            >
              {!momentoProgress.encuentro1 && !unlockedWithCode.encuentro1 && <Lock className="h-4 w-4" />}
              <span className="font-semibold text-xs text-center">ENCUENTRO 1</span>
            </TabsTrigger>
            <TabsTrigger 
              value="encuentro2" 
              className="flex flex-col items-center gap-1 justify-center py-3 relative"
            >
              {!momentoProgress.encuentro2 && !unlockedWithCode.encuentro2 && <Lock className="h-4 w-4" />}
              <span className="font-semibold text-xs text-center">ENCUENTRO 2</span>
            </TabsTrigger>
            <TabsTrigger 
              value="encuentro3" 
              className="flex flex-col items-center gap-1 justify-center py-3 relative"
            >
              {!momentoProgress.encuentro3 && !unlockedWithCode.encuentro3 && <Lock className="h-4 w-4" />}
              <span className="font-semibold text-xs text-center">ENCUENTRO 3</span>
            </TabsTrigger>
            <TabsTrigger 
              value="encuentro4" 
              className="flex flex-col items-center gap-1 justify-center py-3 relative"
            >
              {!momentoProgress.encuentro4 && !unlockedWithCode.encuentro4 && <Lock className="h-4 w-4" />}
              <span className="font-semibold text-xs text-center">ENCUENTRO 4</span>
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
                  onComplete={() => handleMomentoComplete('diagnostico')} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nivelatorio" className="space-y-6">
            {!momentoProgress.nivelatorio ? (
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
                  <NivelatorioMomento onComplete={() => handleMomentoComplete('nivelatorio')} />
                </CardContent>
              </Card>
            )}
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
                  isLocked={!momentoProgress.encuentro1 && !unlockedWithCode.encuentro1}
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
                  isLocked={!momentoProgress.encuentro2 && !unlockedWithCode.encuentro2}
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
                  isLocked={!momentoProgress.encuentro3 && !unlockedWithCode.encuentro3}
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
                  isLocked={!momentoProgress.encuentro4 && !unlockedWithCode.encuentro4}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Unlock Dialog */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Desbloquear Momento
            </DialogTitle>
            <DialogDescription>
              Para acceder a este momento, puedes:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Completar el momento anterior, o</li>
                <li>Ingresar el código de acceso especial</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="unlock-code" className="text-sm font-medium">
                Código de acceso
              </label>
              <Input
                id="unlock-code"
                type="text"
                placeholder="Ingresa el código"
                value={unlockCode}
                onChange={(e) => setUnlockCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUnlockWithCode();
                  }
                }}
                className="uppercase"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowUnlockDialog(false);
              setUnlockCode('');
            }}>
              Cancelar
            </Button>
            <Button onClick={handleUnlockWithCode}>
              Desbloquear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EstudianteDashboard;
