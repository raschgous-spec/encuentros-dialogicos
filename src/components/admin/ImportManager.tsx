 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { ExcelUploader } from './ExcelUploader';
 import { UserCog, GraduationCap } from 'lucide-react';
 
 export const ImportManager = () => {
   return (
     <div className="space-y-6">
       <div>
         <h2 className="text-2xl font-bold">Importar Usuarios Autorizados</h2>
         <p className="text-muted-foreground">
           Cargue archivos Excel para importar coordinadores y estudiantes autorizados
         </p>
       </div>
 
       <Tabs defaultValue="coordinadores" className="space-y-4">
         <TabsList>
           <TabsTrigger value="coordinadores" className="gap-2">
             <UserCog className="h-4 w-4" />
             Coordinadores
           </TabsTrigger>
           <TabsTrigger value="estudiantes" className="gap-2">
             <GraduationCap className="h-4 w-4" />
             Estudiantes
           </TabsTrigger>
         </TabsList>
 
         <TabsContent value="coordinadores">
           <ExcelUploader type="coordinadores" />
         </TabsContent>
 
         <TabsContent value="estudiantes">
           <ExcelUploader type="estudiantes" />
         </TabsContent>
       </Tabs>
     </div>
   );
 };