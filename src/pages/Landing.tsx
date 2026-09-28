import { useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, ArrowRight } from 'lucide-react';
import udecLogo from '@/assets/udec-logo.png';

const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-accent flex flex-col">
      <header className="px-6 py-6 flex items-center gap-4 max-w-6xl w-full mx-auto">
        <img src={udecLogo} alt="Universidad de Cundinamarca" className="h-14 w-auto" />
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Universidad de Cundinamarca</p>
          <h1 className="text-lg md:text-xl font-bold">Encuentros Dialógicos · CAI</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center px-6 pb-12">
        <div className="max-w-6xl w-full mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-3">
            ¿Cómo quieres ingresar?
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            Elige tu plataforma. Los estudiantes entran directamente con su documento y correo institucional.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => navigate('/estudiantes')}
              className="group text-left rounded-2xl bg-primary text-primary-foreground p-8 md:p-10 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              <GraduationCap className="h-12 w-12 mb-6" />
              <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-primary-foreground/20 rounded-full px-3 py-1 mb-4">
                Acceso preferente · sin registro
              </span>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Plataforma de Estudiantes</h3>
              <p className="opacity-90 mb-8">
                Participa en los 6 momentos del encuentro dialógico y consulta tu espacio de aprendizaje.
              </p>
              <span className="inline-flex items-center gap-2 font-semibold">
                Ingresar <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button
              onClick={() => navigate('/auth')}
              className="group text-left rounded-2xl bg-card border border-border p-8 md:p-10 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <Briefcase className="h-12 w-12 mb-6 text-primary" />
              <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-accent text-accent-foreground rounded-full px-3 py-1 mb-4">
                Con usuario y contraseña
              </span>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Plataforma de Gestores del Conocimiento</h3>
              <p className="text-muted-foreground mb-8">
                Coordinadores, Gestores del Conocimiento y el Aprendizaje, observadores y administradores.
              </p>
              <span className="inline-flex items-center gap-2 font-semibold text-primary">
                Iniciar sesión <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
