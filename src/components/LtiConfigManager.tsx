import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Copy, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface LtiPlatform {
  id: string;
  name: string;
  issuer: string;
  client_id: string;
  auth_login_url: string;
  auth_token_url: string;
  jwks_url: string;
  deployment_id: string | null;
  created_at: string;
}

export const LtiConfigManager = () => {
  const [platforms, setPlatforms] = useState<LtiPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: '',
    issuer: '',
    client_id: '',
    auth_login_url: '',
    auth_token_url: '',
    jwks_url: '',
    deployment_id: '',
  });

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const toolUrls = {
    oidcLoginUrl: `${supabaseUrl}/functions/v1/lti-oidc-login`,
    launchUrl: `${supabaseUrl}/functions/v1/lti-launch`,
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    const { data, error } = await supabase
      .from('lti_platforms')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setPlatforms(data);
    setLoading(false);
  };

  const handleAdd = async () => {
    const { error } = await supabase.from('lti_platforms').insert({
      name: form.name,
      issuer: form.issuer,
      client_id: form.client_id,
      auth_login_url: form.auth_login_url,
      auth_token_url: form.auth_token_url,
      jwks_url: form.jwks_url,
      deployment_id: form.deployment_id || null,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Plataforma LTI registrada' });
      setShowAdd(false);
      setForm({ name: '', issuer: '', client_id: '', auth_login_url: '', auth_token_url: '', jwks_url: '', deployment_id: '' });
      fetchPlatforms();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('lti_platforms').delete().eq('id', id);
    if (!error) {
      toast({ title: 'Plataforma eliminada' });
      fetchPlatforms();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado al portapapeles' });
  };

  const moodleInstructions = `
### Configuración en Moodle 4.5

1. Ve a **Administración del sitio → Plugins → Módulos de actividad → Herramienta externa → Gestionar herramientas**
2. Haz clic en **"Configurar una herramienta manualmente"**
3. Completa los siguientes campos:
   - **Nombre de la herramienta**: Encuentros Dialógicos
   - **URL de la herramienta**: ${toolUrls.launchUrl}
   - **Versión de LTI**: LTI 1.3
   - **Tipo de clave pública**: URL del conjunto de claves
   - **URL de inicio de sesión de inicio**: ${toolUrls.oidcLoginUrl}
   - **URI(s) de redirección**: ${toolUrls.launchUrl}
4. En **Servicios** habilita "Compartir nombre del lanzador" y "Compartir email del lanzador"
5. Guarda y copia el **Client ID**, **Deployment ID** e **Issuer** que genera Moodle
6. Regresa aquí y registra la plataforma con esos datos
  `.trim();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Integración LTI 1.3 (Moodle)
          </CardTitle>
          <CardDescription>
            Configura la integración con Moodle para que los usuarios accedan directamente sin login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">URLs de la herramienta (para configurar en Moodle):</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <code className="text-xs bg-background p-1 rounded flex-1 overflow-auto">{toolUrls.oidcLoginUrl}</code>
                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(toolUrls.oidcLoginUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">URL de inicio de sesión OIDC</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <code className="text-xs bg-background p-1 rounded flex-1 overflow-auto">{toolUrls.launchUrl}</code>
                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(toolUrls.launchUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">URL de lanzamiento / Redirect URI</p>
            </div>
          </div>

          <details className="bg-muted/50 p-4 rounded-lg">
            <summary className="font-semibold text-sm cursor-pointer">📋 Instrucciones de configuración en Moodle 4.5</summary>
            <div className="mt-3 text-sm whitespace-pre-line text-muted-foreground">{moodleInstructions}</div>
          </details>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Plataformas LTI registradas</CardTitle>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Agregar plataforma</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Registrar plataforma Moodle</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Nombre</Label>
                  <Input placeholder="Mi Moodle" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Issuer (Platform ID)</Label>
                  <Input placeholder="https://moodle.tudominio.edu.co" value={form.issuer} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))} />
                </div>
                <div>
                  <Label>Client ID</Label>
                  <Input placeholder="Generado por Moodle" value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} />
                </div>
                <div>
                  <Label>Auth Login URL</Label>
                  <Input placeholder="https://moodle.tudominio.edu.co/mod/lti/auth.php" value={form.auth_login_url} onChange={e => setForm(f => ({ ...f, auth_login_url: e.target.value }))} />
                </div>
                <div>
                  <Label>Auth Token URL</Label>
                  <Input placeholder="https://moodle.tudominio.edu.co/mod/lti/token.php" value={form.auth_token_url} onChange={e => setForm(f => ({ ...f, auth_token_url: e.target.value }))} />
                </div>
                <div>
                  <Label>JWKS URL</Label>
                  <Input placeholder="https://moodle.tudominio.edu.co/mod/lti/certs.php" value={form.jwks_url} onChange={e => setForm(f => ({ ...f, jwks_url: e.target.value }))} />
                </div>
                <div>
                  <Label>Deployment ID (opcional)</Label>
                  <Input placeholder="1" value={form.deployment_id} onChange={e => setForm(f => ({ ...f, deployment_id: e.target.value }))} />
                </div>
                <Button onClick={handleAdd} className="w-full">Registrar plataforma</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : platforms.length === 0 ? (
            <p className="text-muted-foreground text-sm">No hay plataformas LTI registradas. Agrega tu instancia de Moodle.</p>
          ) : (
            <div className="space-y-3">
              {platforms.map(p => (
                <div key={p.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.issuer} — Client: {p.client_id}</p>
                  </div>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
