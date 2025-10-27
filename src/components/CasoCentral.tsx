import { Book } from 'lucide-react';

export const CasoCentral = () => {
  return (
    <div className="bg-accent border-l-4 border-primary p-6 rounded-lg mb-6">
      <div className="flex items-start gap-3">
        <Book className="text-primary mt-1 flex-shrink-0" size={24} />
        <div>
          <h3 className="font-bold text-lg mb-2 text-accent-foreground">
            CASO CENTRAL: "El campus que produce, pero también contamina"
          </h3>
          <p className="text-accent-foreground mb-3">
            En el entorno universitario, varios emprendimientos y proyectos productivos locales 
            (huertas, biolaboratorios, cafeterías sostenibles) buscan aportar al bienestar ambiental. 
            Sin embargo, los residuos generados, el uso de materiales no biodegradables y el consumo 
            energético van en aumento.
          </p>
          <p className="text-accent-foreground">
            Se requiere identificar los principales problemas, analizar sus causas y proponer 
            alternativas sostenibles que equilibren productividad y sostenibilidad.
          </p>
        </div>
      </div>
    </div>
  );
};
