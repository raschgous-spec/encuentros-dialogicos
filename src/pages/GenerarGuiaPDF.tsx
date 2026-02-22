import { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';

const GenerarGuiaPDF = () => {
  const generated = useRef(false);

  useEffect(() => {
    if (generated.current) return;
    generated.current = true;

    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    let y = 10;

    const addLogo = () => {
      try {
        const logo = new Image();
        logo.src = '/logo-udec.png';
        const lw = 60, lh = 20;
        doc.addImage(logo, 'PNG', (pw - lw) / 2, y, lw, lh);
        y += lh + 10;
      } catch { /* skip */ }
    };

    const checkPage = (needed = 30) => {
      if (y > ph - needed) { doc.addPage(); y = 20; }
    };

    const title = (text: string, size = 14) => {
      checkPage(40);
      doc.setFontSize(size);
      doc.setFont('helvetica', 'bold');
      doc.text(text, 14, y);
      y += size === 18 ? 12 : size === 16 ? 10 : 8;
    };

    const body = (text: string, indent = 14) => {
      checkPage(15);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(text, pw - indent - 14);
      doc.text(lines, indent, y);
      y += lines.length * 5 + 2;
    };

    const bullet = (text: string, indent = 20) => {
      checkPage(12);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(`• ${text}`, pw - indent - 14);
      doc.text(lines, indent, y);
      y += lines.length * 5 + 1;
    };

    const numberedItem = (num: number, text: string, indent = 20) => {
      checkPage(12);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(`${num}. ${text}`, pw - indent - 14);
      doc.text(lines, indent, y);
      y += lines.length * 5 + 1;
    };

    const space = (s = 5) => { y += s; };

    // ===== PORTADA =====
    addLogo();
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('GUÍA DE REGISTRO Y USO', pw / 2, y, { align: 'center' });
    y += 10;
    doc.text('GENERAL DE LA PLATAFORMA', pw / 2, y, { align: 'center' });
    y += 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('ENCUENTROS DIALÓGICOS', pw / 2, y, { align: 'center' });
    y += 8;
    doc.text('Universidad de Cundinamarca', pw / 2, y, { align: 'center' });
    y += 15;
    doc.setFontSize(11);
    doc.text('Versión 1.0 — Febrero 2026', pw / 2, y, { align: 'center' });

    // ===== TABLA DE CONTENIDO =====
    doc.addPage(); y = 20;
    title('TABLA DE CONTENIDO', 16);
    space(5);
    const toc = [
      '1. Introducción',
      '2. Acceso a la Plataforma',
      '3. Guía para Estudiantes',
      '4. Guía para Coordinadores (Docentes)',
      '5. Guía para Observadores Administrativos',
      '6. Guía para Administradores',
      '7. Preguntas Frecuentes',
    ];
    toc.forEach(t => { body(t); });

    // ===== 1. INTRODUCCIÓN =====
    doc.addPage(); y = 20;
    title('1. INTRODUCCIÓN', 16);
    body('La plataforma Encuentros Dialógicos de la Universidad de Cundinamarca es un sistema de gestión del conocimiento que facilita la participación estudiantil a través de encuentros dialógicos estructurados en 6 momentos secuenciales.');
    space(5);
    title('Momentos del proceso:');
    numberedItem(1, 'Diagnóstico — Evaluación inicial de conocimientos sobre herramientas de gestión.');
    numberedItem(2, 'Nivelatorio — Capacitación en herramientas: Brainstorming, Ishikawa, Pareto, DOFA, Affinity, Árbol de Problemas.');
    numberedItem(3, 'Encuentro 1 — Primer encuentro dialógico con acta y participación.');
    numberedItem(4, 'Encuentro 2 — Segundo encuentro dialógico.');
    numberedItem(5, 'Encuentro 3 — Tercer encuentro dialógico con acta y participación.');
    numberedItem(6, 'Encuentro 4 — Cuarto encuentro dialógico: Portafolio y caso de estudio.');
    space(5);
    title('Tipos de Usuario:');
    bullet('Estudiante: Participa en los encuentros dialógicos y completa evaluaciones.');
    bullet('Coordinador (Docente): Gestiona los CAI, monitorea el progreso de estudiantes y revisa evaluaciones.');
    bullet('Observador Administrativo: Visualiza la actividad general de estudiantes y coordinadores (solo lectura).');
    bullet('Administrador: Gestión completa del sistema, importación de datos y asignación de roles.');

    // ===== 2. ACCESO =====
    doc.addPage(); y = 20;
    title('2. ACCESO A LA PLATAFORMA', 16);
    body('Ingrese a la plataforma a través del enlace proporcionado por su institución.');
    body('Al ingresar verá la página principal con las opciones: "Iniciar Sesión" (si ya tiene cuenta) o "Ir a Autenticación" (para registrarse o iniciar sesión).');

    // ===== 3. ESTUDIANTES =====
    doc.addPage(); y = 20;
    title('3. GUÍA PARA ESTUDIANTES', 16);
    space(3);
    title('3.1 Requisitos previos');
    bullet('Estar registrado en la base de datos de estudiantes autorizados del sistema (su coordinador debe haber cargado sus datos previamente).');
    bullet('Contar con su número de documento y correo institucional.');
    space(5);
    title('3.2 Registro paso a paso');
    numberedItem(1, 'Ingrese a la plataforma y haga clic en "Ir a Autenticación".');
    numberedItem(2, 'En la pantalla de autenticación, seleccione el botón "Estudiante" (con el ícono de birrete).');
    numberedItem(3, 'Haga clic en la pestaña "Registrarse".');
    numberedItem(4, 'Complete el formulario: Nombre completo, Número de documento, Email (correo institucional) y Contraseña (mínimo 6 caracteres).');
    numberedItem(5, 'Haga clic en "Registrarse".');
    numberedItem(6, 'Revise su correo electrónico para confirmar su cuenta haciendo clic en el enlace de verificación.');
    numberedItem(7, 'Una vez confirmado, regrese a la plataforma e inicie sesión con su correo y contraseña.');
    space(3);
    body('NOTA: Si al registrarse recibe un error de "Estudiante no encontrado", contacte a su coordinador para verificar que sus datos estén correctamente cargados en el sistema.', 20);
    space(5);
    title('3.3 Inicio de sesión');
    numberedItem(1, 'En la pantalla de autenticación, seleccione "Estudiante".');
    numberedItem(2, 'En la pestaña "Iniciar Sesión", ingrese su correo y contraseña.');
    numberedItem(3, 'Haga clic en "Iniciar Sesión".');
    space(5);
    title('3.4 Dashboard del Estudiante');
    body('Al iniciar sesión, accederá al Dashboard del Estudiante que muestra:');
    bullet('Barra de progreso: Indica en qué momento se encuentra actualmente.');
    bullet('Momentos disponibles: Los 6 momentos aparecen en orden secuencial. Solo puede acceder al siguiente momento cuando haya completado el anterior.');
    space(5);
    title('3.5 Momento 1 — Diagnóstico');
    numberedItem(1, 'Haga clic en "Diagnóstico" en su dashboard.');
    numberedItem(2, 'Responda las preguntas de evaluación sobre herramientas de gestión del conocimiento.');
    numberedItem(3, 'Al completar, recibirá su puntaje y podrá avanzar al siguiente momento.');
    space(5);
    title('3.6 Momento 2 — Nivelatorio');
    numberedItem(1, 'Acceda al momento "Nivelatorio".');
    numberedItem(2, 'Revise el material educativo sobre las herramientas: Brainstorming, Ishikawa, Pareto, DOFA, Affinity y Árbol de Problemas.');
    numberedItem(3, 'Seleccione una problemática de las disponibles.');
    numberedItem(4, 'Complete las evaluaciones de cada herramienta aplicada a la problemática seleccionada.');
    numberedItem(5, 'Al aprobar todas las evaluaciones, podrá avanzar al Encuentro 1.');
    space(5);
    title('3.7 Momentos 3 a 6 — Encuentros Dialógicos');
    numberedItem(1, 'Acceda al encuentro correspondiente.');
    numberedItem(2, 'Participe en las actividades programadas.');
    numberedItem(3, 'En los encuentros con acta (Encuentro 1 y 3), podrá ver el acta generada por su coordinador.');
    numberedItem(4, 'En el Encuentro 4, deberá completar su Portafolio y Caso de Estudio.');
    space(5);
    title('3.8 Cerrar sesión');
    numberedItem(1, 'Haga clic en su nombre de usuario en la esquina superior derecha.');
    numberedItem(2, 'En el menú desplegable, seleccione "Cerrar Sesión".');

    // ===== 4. COORDINADORES =====
    doc.addPage(); y = 20;
    title('4. GUÍA PARA COORDINADORES (DOCENTES)', 16);
    space(3);
    title('4.1 Requisitos previos');
    bullet('Estar registrado en la base de datos de coordinadores autorizados (el administrador debe haberlo cargado previamente).');
    bullet('Contar con su correo institucional, facultad, programa y sede registrados.');
    space(5);
    title('4.2 Registro paso a paso');
    numberedItem(1, 'Ingrese a la plataforma y haga clic en "Ir a Autenticación".');
    numberedItem(2, 'Seleccione el botón "Coordinador" (con el ícono de libro).');
    numberedItem(3, 'Haga clic en la pestaña "Registrarse".');
    numberedItem(4, 'Complete el formulario: Nombre completo, Email, Contraseña, Facultad, Programa y Sede (se cargan automáticamente del sistema).');
    numberedItem(5, 'Haga clic en "Registrarse como Coordinador".');
    numberedItem(6, 'Confirme su correo electrónico a través del enlace de verificación.');
    numberedItem(7, 'Inicie sesión con sus credenciales.');
    space(5);
    title('4.3 Dashboard del Coordinador');
    body('Al iniciar sesión, accederá al panel de coordinador con las siguientes secciones:');
    space(3);
    title('4.3.1 Gestión de Estudiantes');
    bullet('Visualice la lista de estudiantes asignados a su programa.');
    bullet('Consulte el progreso individual de cada estudiante en los diferentes momentos.');
    space(3);
    title('4.3.2 Seguimiento en Tiempo Real');
    bullet('Monitoree en tiempo real qué estudiantes están activos y en qué momento se encuentran.');
    bullet('Vea estadísticas generales de participación y completitud.');
    space(3);
    title('4.3.3 Evaluaciones');
    bullet('Revise las evaluaciones completadas por los estudiantes.');
    bullet('Asigne calificaciones de coordinador y comentarios a las evaluaciones.');
    bullet('Filtre evaluaciones por momento, estudiante o estado de revisión.');
    space(3);
    title('4.3.4 Gestión de Actas (Encuentros 1 y 3)');
    bullet('Cree actas de encuentro con: fecha, hora, lugar, director, secretario, objetivos, agenda.');
    bullet('Use el buscador de estudiantes para agregar asistentes al acta por nombre.');
    bullet('Registre temas institucionales, de facultad y de programa.');
    bullet('Registre proposiciones de estudiantes y plan de mejoramiento.');
    space(3);
    title('4.3.5 Estadísticas');
    bullet('Consulte gráficas de rendimiento de sus estudiantes.');
    bullet('Compare resultados por herramienta de gestión (Brainstorming, Ishikawa, Pareto, DOFA, Affinity).');

    // ===== 5. OBSERVADORES =====
    doc.addPage(); y = 20;
    title('5. GUÍA PARA OBSERVADORES ADMINISTRATIVOS', 16);
    space(3);
    title('5.1 Requisitos previos');
    body('El acceso de Observador Administrativo es asignado únicamente por el administrador del sistema. No es posible auto-registrarse como observador.');
    space(5);
    title('5.2 Inicio de sesión');
    numberedItem(1, 'Ingrese a la plataforma y haga clic en "Ir a Autenticación".');
    numberedItem(2, 'Seleccione el botón "Observador Adm." (con el ícono de ojo).');
    numberedItem(3, 'En la pestaña "Iniciar Sesión", ingrese las credenciales proporcionadas por el administrador.');
    numberedItem(4, 'Haga clic en "Iniciar Sesión".');
    body('NOTA: La pestaña de "Registrarse" está deshabilitada para este tipo de usuario.', 20);
    space(5);
    title('5.3 Dashboard del Observador');
    body('El observador tiene acceso de solo lectura a:');
    bullet('Actividad general: Visualización del progreso de todos los estudiantes y coordinadores.');
    bullet('Estadísticas globales: Gráficas y métricas de rendimiento a nivel institucional.');
    bullet('Evaluaciones: Consulta de evaluaciones completadas (sin posibilidad de edición).');

    // ===== 6. ADMINISTRADORES =====
    doc.addPage(); y = 20;
    title('6. GUÍA PARA ADMINISTRADORES', 16);
    space(3);
    title('6.1 Requisitos previos');
    body('Las credenciales de administrador son proporcionadas por el equipo técnico del sistema. No es posible auto-registrarse como administrador.');
    space(5);
    title('6.2 Inicio de sesión');
    numberedItem(1, 'Seleccione el botón "Admin" (con el ícono de escudo).');
    numberedItem(2, 'Ingrese sus credenciales en la pestaña "Iniciar Sesión".');
    numberedItem(3, 'Haga clic en "Iniciar Sesión".');
    body('NOTA: La pestaña de "Registrarse" está deshabilitada para administradores.', 20);
    space(5);
    title('6.3 Dashboard del Administrador');
    body('El administrador tiene acceso completo al sistema:');
    space(3);
    title('6.3.1 Importación de Datos');
    bullet('Importar archivo Excel (.xlsx) con los datos de coordinadores y estudiantes autorizados.');
    bullet('Coordinadores requiere: nombre_completo, correo, facultad, programa, sede.');
    bullet('Estudiantes requiere: nombre_completo, documento, correo, facultad, programa, sede.');
    space(3);
    title('6.3.2 Gestión de Roles');
    bullet('Visualice todos los usuarios registrados y sus roles actuales.');
    bullet('Asigne o modifique roles: Administrador, Coordinador (Docente), Estudiante, Observador.');
    bullet('Cree nuevos usuarios con roles específicos.');
    space(3);
    title('6.3.3 Gestión de Cursos (CAI)');
    bullet('Cree y administre los CAI (Comunidades de Aprendizaje e Investigación).');
    bullet('Asigne coordinadores a cada CAI y genere códigos de acceso.');
    space(3);
    title('6.3.4 Gestión de Docentes y Estudiantes');
    bullet('Visualice la lista de coordinadores y estudiantes registrados.');
    bullet('Consulte su actividad, progreso y evaluaciones.');
    space(3);
    title('6.3.5 Evaluaciones y Estadísticas');
    bullet('Acceda a todas las evaluaciones del sistema.');
    bullet('Filtre por momento, coordinador, programa o estudiante.');
    bullet('Consulte estadísticas globales de uso, participación y rendimiento.');

    // ===== 7. FAQ =====
    doc.addPage(); y = 20;
    title('7. PREGUNTAS FRECUENTES', 16);
    space(5);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.text('¿Qué hago si olvidé mi contraseña?', 14, y); y += 6;
    body('Contacte al administrador del sistema para restablecer su contraseña.');
    space(5);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    checkPage(20);
    doc.text('¿Por qué no puedo registrarme?', 14, y); y += 6;
    body('Verifique que: sus datos (documento, correo) estén correctamente cargados en el sistema, esté seleccionando el tipo de usuario correcto, y su correo institucional sea el mismo que aparece en la base de datos.');
    space(5);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    checkPage(20);
    doc.text('¿Por qué no puedo acceder al siguiente momento?', 14, y); y += 6;
    body('Los momentos son secuenciales. Debe completar y aprobar el momento anterior para desbloquear el siguiente.');
    space(5);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    checkPage(20);
    doc.text('¿Cómo sé si mi evaluación fue aprobada?', 14, y); y += 6;
    body('En su dashboard podrá ver el estado de cada evaluación. Su coordinador puede asignar una calificación y comentarios.');
    space(5);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    checkPage(20);
    doc.text('¿Quién puede crear cuentas de Observador o Admin?', 14, y); y += 6;
    body('Solo el Administrador del sistema puede crear y asignar estos roles.');
    space(5);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    checkPage(20);
    doc.text('¿Cómo agrego asistentes al acta de un encuentro?', 14, y); y += 6;
    body('En la sección de participantes del acta, use el buscador de estudiantes: escriba el nombre, selecciónelo de la lista desplegable y se agregará automáticamente.');

    // ===== FOOTERS =====
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Página ${i} de ${pageCount} | Guía de Uso — Encuentros Dialógicos — Universidad de Cundinamarca`,
        pw / 2, ph - 10, { align: 'center' }
      );
    }

    doc.save('Guia_Uso_Plataforma_Encuentros_Dialogicos.pdf');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <p className="text-lg font-semibold">Generando PDF...</p>
        <p className="text-muted-foreground">La descarga comenzará automáticamente.</p>
        <a href="/" className="text-primary underline">Volver al inicio</a>
      </div>
    </div>
  );
};

export default GenerarGuiaPDF;
