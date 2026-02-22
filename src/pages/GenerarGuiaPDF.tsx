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

    const green = [46, 125, 50]; // #2E7D32
    const lightGreen = [200, 230, 201];
    const darkGray = [55, 55, 55];
    const medGray = [120, 120, 120];
    const lightGray = [240, 240, 240];

    const checkPage = (needed = 30) => {
      if (y > ph - needed) { doc.addPage(); y = 20; }
    };

    const title = (text: string, size = 14) => {
      checkPage(40);
      doc.setFontSize(size);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkGray as [number, number, number]);
      doc.text(text, 14, y);
      if (size >= 16) {
        doc.setDrawColor(...green as [number, number, number]);
        doc.setLineWidth(0.8);
        doc.line(14, y + 2, pw - 14, y + 2);
      }
      y += size === 18 ? 14 : size === 16 ? 12 : 9;
    };

    const body = (text: string, indent = 14) => {
      checkPage(15);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkGray as [number, number, number]);
      const lines = doc.splitTextToSize(text, pw - indent - 14);
      doc.text(lines, indent, y);
      y += lines.length * 5 + 2;
    };

    const bullet = (text: string, indent = 20) => {
      checkPage(12);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkGray as [number, number, number]);
      doc.setFillColor(...green as [number, number, number]);
      doc.circle(indent - 3, y - 1.5, 1.2, 'F');
      const lines = doc.splitTextToSize(text, pw - indent - 14);
      doc.text(lines, indent, y);
      y += lines.length * 5 + 1;
    };

    const numberedItem = (num: number, text: string, indent = 20) => {
      checkPage(12);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(...green as [number, number, number]);
      doc.circle(indent - 3, y - 1.5, 3.5, 'F');
      doc.text(String(num), indent - 3, y, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkGray as [number, number, number]);
      const lines = doc.splitTextToSize(text, pw - indent - 18);
      doc.text(lines, indent + 3, y);
      y += lines.length * 5 + 2;
    };

    const noteBox = (text: string) => {
      checkPage(25);
      const boxW = pw - 28;
      const lines = doc.splitTextToSize(text, boxW - 10);
      const boxH = lines.length * 5 + 8;
      doc.setFillColor(255, 243, 224);
      doc.setDrawColor(255, 152, 0);
      doc.roundedRect(14, y - 4, boxW, boxH, 2, 2, 'FD');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(230, 81, 0);
      doc.text('⚠ NOTA:', 18, y + 1);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 60, 0);
      doc.text(lines, 18, y + 6);
      y += boxH + 4;
    };

    const tipBox = (text: string) => {
      checkPage(25);
      const boxW = pw - 28;
      const lines = doc.splitTextToSize(text, boxW - 10);
      const boxH = lines.length * 5 + 8;
      doc.setFillColor(232, 245, 233);
      doc.setDrawColor(...green as [number, number, number]);
      doc.roundedRect(14, y - 4, boxW, boxH, 2, 2, 'FD');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...green as [number, number, number]);
      doc.text('✓ TIP:', 18, y + 1);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(27, 94, 32);
      doc.text(lines, 18, y + 6);
      y += boxH + 4;
    };

    const space = (s = 5) => { y += s; };

    // Draw a mockup of a screen
    const drawScreenMockup = (caption: string, elements: { type: string; label: string; x: number; y: number; w: number; h: number; active?: boolean }[]) => {
      checkPage(90);
      const mx = 30;
      const mw = pw - 60;
      const mh = 70;
      const my = y;

      // Browser frame
      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(mx, my, mw, mh, 3, 3, 'FD');

      // Title bar
      doc.setFillColor(230, 230, 230);
      doc.roundedRect(mx, my, mw, 8, 3, 3, 'F');
      doc.rect(mx, my + 5, mw, 3, 'F');
      // Dots
      doc.setFillColor(255, 95, 87);
      doc.circle(mx + 5, my + 4, 1.5, 'F');
      doc.setFillColor(255, 189, 46);
      doc.circle(mx + 10, my + 4, 1.5, 'F');
      doc.setFillColor(39, 201, 63);
      doc.circle(mx + 15, my + 4, 1.5, 'F');

      // Content area
      doc.setFillColor(255, 255, 255);
      doc.rect(mx + 2, my + 10, mw - 4, mh - 12, 'F');

      // Draw elements inside
      elements.forEach(el => {
        const ex = mx + 2 + el.x;
        const ey = my + 10 + el.y;
        if (el.type === 'button') {
          const btnColor = el.active ? green : lightGray;
          doc.setFillColor(btnColor[0], btnColor[1], btnColor[2]);
          doc.roundedRect(ex, ey, el.w, el.h, 1.5, 1.5, 'F');
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          const txtVal = el.active ? 255 : 80;
          doc.setTextColor(txtVal, txtVal, txtVal);
          doc.text(el.label, ex + el.w / 2, ey + el.h / 2 + 1.5, { align: 'center' });
        } else if (el.type === 'input') {
          doc.setFillColor(250, 250, 250);
          doc.setDrawColor(200, 200, 200);
          doc.roundedRect(ex, ey, el.w, el.h, 1, 1, 'FD');
          doc.setFontSize(6);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...medGray as [number, number, number]);
          doc.text(el.label, ex + 3, ey + el.h / 2 + 1);
        } else if (el.type === 'text') {
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...darkGray as [number, number, number]);
          doc.text(el.label, ex, ey + 4);
        } else if (el.type === 'header') {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...darkGray as [number, number, number]);
          doc.text(el.label, ex + el.w / 2, ey + 5, { align: 'center' });
        }
      });

      y += mh + 3;

      // Caption
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...medGray as [number, number, number]);
      doc.text(caption, pw / 2, y, { align: 'center' });
      y += 8;
    };

    // ===== PORTADA =====
    doc.setFillColor(...green as [number, number, number]);
    doc.rect(0, 0, pw, 80, 'F');
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('GUÍA DE REGISTRO Y USO', pw / 2, 30, { align: 'center' });
    doc.text('GENERAL DE LA PLATAFORMA', pw / 2, 42, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('ENCUENTROS DIALÓGICOS', pw / 2, 60, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Universidad de Cundinamarca', pw / 2, 72, { align: 'center' });

    // Subtitle area
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pw / 2 - 60, 90, 120, 30, 4, 4, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...green as [number, number, number]);
    doc.text('Versión 1.0', pw / 2, 102, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...medGray as [number, number, number]);
    doc.text('Febrero 2026', pw / 2, 112, { align: 'center' });

    // Features
    y = 140;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray as [number, number, number]);
    doc.text('Esta guía incluye:', pw / 2, y, { align: 'center' });
    y += 12;
    const features = [
      'Registro e inicio de sesión para cada tipo de usuario',
      'Navegación por los 6 momentos del proceso',
      'Gestión de estudiantes y evaluaciones (Coordinadores)',
      'Administración del sistema (Administradores)',
      'Capturas de pantalla y diagramas de referencia',
    ];
    features.forEach(f => {
      doc.setFillColor(...green as [number, number, number]);
      doc.circle(pw / 2 - 60, y - 1.5, 1.5, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkGray as [number, number, number]);
      doc.text(f, pw / 2 - 55, y);
      y += 7;
    });

    // ===== TABLA DE CONTENIDO =====
    doc.addPage(); y = 20;
    title('TABLA DE CONTENIDO', 16);
    space(5);
    const toc = [
      { num: '1', text: 'Introducción', pg: '3' },
      { num: '2', text: 'Acceso a la Plataforma', pg: '4' },
      { num: '3', text: 'Guía para Estudiantes', pg: '5' },
      { num: '4', text: 'Guía para Coordinadores (Docentes)', pg: '8' },
      { num: '5', text: 'Guía para Observadores Administrativos', pg: '10' },
      { num: '6', text: 'Guía para Administradores', pg: '11' },
      { num: '7', text: 'Preguntas Frecuentes', pg: '12' },
    ];
    toc.forEach(t => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkGray as [number, number, number]);
      doc.text(`${t.num}. ${t.text}`, 20, y);
      doc.setTextColor(...medGray as [number, number, number]);
      const dots = '.'.repeat(60);
      const dotsW = doc.getTextWidth(dots);
      const textW = doc.getTextWidth(`${t.num}. ${t.text}`);
      const available = pw - 40 - textW;
      const truncDots = '.'.repeat(Math.floor(available / doc.getTextWidth('.')));
      doc.text(truncDots, 20 + textW + 2, y);
      doc.text(t.pg, pw - 20, y, { align: 'right' });
      y += 8;
    });

    // ===== 1. INTRODUCCIÓN =====
    doc.addPage(); y = 20;
    title('1. INTRODUCCIÓN', 16);
    space(3);
    body('La plataforma Encuentros Dialógicos de la Universidad de Cundinamarca es un sistema de gestión del conocimiento que facilita la participación estudiantil a través de encuentros dialógicos estructurados en 6 momentos secuenciales.');
    space(5);

    // Momentos table
    title('Momentos del proceso:');
    const momentos = [
      ['1', 'Diagnóstico', 'Evaluación inicial de conocimientos'],
      ['2', 'Nivelatorio', 'Capacitación en herramientas de gestión'],
      ['3', 'Encuentro 1', 'Primer encuentro con acta y participación'],
      ['4', 'Encuentro 2', 'Segundo encuentro dialógico'],
      ['5', 'Encuentro 3', 'Tercer encuentro con acta y participación'],
      ['6', 'Encuentro 4', 'Portafolio y caso de estudio'],
    ];
    // Table header
    const tw = pw - 28;
    doc.setFillColor(...green as [number, number, number]);
    doc.rect(14, y - 4, tw, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('#', 18, y);
    doc.text('Momento', 30, y);
    doc.text('Descripción', 80, y);
    y += 6;
    momentos.forEach((m, i) => {
      doc.setFillColor(i % 2 === 0 ? 255 : 245, i % 2 === 0 ? 255 : 245, i % 2 === 0 ? 255 : 245);
      doc.rect(14, y - 4, tw, 7, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkGray as [number, number, number]);
      doc.text(m[0], 18, y);
      doc.setFont('helvetica', 'bold');
      doc.text(m[1], 30, y);
      doc.setFont('helvetica', 'normal');
      doc.text(m[2], 80, y);
      y += 7;
    });
    space(8);

    title('Tipos de Usuario:');
    const userTypes = [
      ['Estudiante', 'Participa en los encuentros dialógicos y completa evaluaciones.'],
      ['Coordinador', 'Gestiona los CAI, monitorea el progreso y revisa evaluaciones.'],
      ['Observador', 'Visualiza la actividad general (solo lectura).'],
      ['Admin', 'Gestión completa del sistema e importación de datos.'],
    ];
    userTypes.forEach(u => {
      checkPage(15);
      doc.setFillColor(...lightGreen as [number, number, number]);
      doc.roundedRect(14, y - 4, pw - 28, 10, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...green as [number, number, number]);
      doc.text(u[0], 18, y + 1);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkGray as [number, number, number]);
      doc.text(u[1], 55, y + 1);
      y += 12;
    });

    // ===== 2. ACCESO =====
    doc.addPage(); y = 20;
    title('2. ACCESO A LA PLATAFORMA', 16);
    space(3);
    body('Ingrese a la plataforma a través del enlace proporcionado por su institución.');
    space(3);

    // Draw auth screen mockup
    title('Pantalla de Autenticación:');
    drawScreenMockup(
      'Figura 1: Pantalla de selección de tipo de acceso',
      [
        { type: 'header', label: 'Encuentros Dialógicos - Universidad de Cundinamarca', x: 5, y: 1, w: mw() - 10, h: 8 },
        { type: 'text', label: 'Selecciona tu tipo de acceso', x: 40, y: 10, w: 0, h: 0 },
        { type: 'button', label: 'Estudiante', x: 10, y: 17, w: 55, h: 10, active: true },
        { type: 'button', label: 'Coordinador', x: 70, y: 17, w: 55, h: 10, active: false },
        { type: 'button', label: 'Observador Adm.', x: 10, y: 30, w: 55, h: 10, active: false },
        { type: 'button', label: 'Admin', x: 70, y: 30, w: 55, h: 10, active: false },
        { type: 'input', label: 'tu@email.com', x: 10, y: 45, w: 115, h: 7 },
        { type: 'input', label: '••••••••', x: 10, y: 54, w: 115, h: 7 },
      ]
    );

    function mw() { return pw - 64; }

    space(3);
    body('Al ingresar verá los 4 botones de tipo de acceso. Seleccione el que corresponda a su rol.');

    // ===== 3. ESTUDIANTES =====
    doc.addPage(); y = 20;
    title('3. GUÍA PARA ESTUDIANTES', 16);
    space(3);
    title('3.1 Requisitos previos');
    bullet('Estar registrado en la base de datos de estudiantes autorizados (su coordinador debe haber cargado sus datos previamente).');
    bullet('Contar con su número de documento y correo institucional.');
    space(5);

    title('3.2 Registro paso a paso');
    space(2);

    // Draw registration mockup
    drawScreenMockup(
      'Figura 2: Formulario de registro de estudiante',
      [
        { type: 'header', label: 'Acceso Estudiante', x: 5, y: 1, w: mw() - 10, h: 8 },
        { type: 'button', label: 'Iniciar Sesión', x: 10, y: 10, w: 55, h: 7, active: false },
        { type: 'button', label: 'Registrarse', x: 70, y: 10, w: 55, h: 7, active: true },
        { type: 'text', label: 'Número de Documento', x: 10, y: 22, w: 0, h: 0 },
        { type: 'input', label: 'Ingrese su cédula', x: 10, y: 26, w: 115, h: 6 },
        { type: 'text', label: 'Nombre Completo', x: 10, y: 35, w: 0, h: 0 },
        { type: 'input', label: 'Su nombre', x: 10, y: 39, w: 115, h: 6 },
        { type: 'text', label: 'Email', x: 10, y: 48, w: 0, h: 0 },
        { type: 'input', label: 'correo@ucundinamarca.edu.co', x: 10, y: 52, w: 115, h: 6 },
      ]
    );

    numberedItem(1, 'Ingrese a la plataforma y haga clic en "Ir a Autenticación".');
    numberedItem(2, 'Seleccione el botón "Estudiante" (con el ícono de birrete).');
    numberedItem(3, 'Haga clic en la pestaña "Registrarse".');
    numberedItem(4, 'Complete: Número de documento, Nombre completo, Email y Contraseña (mín. 6 caracteres).');
    numberedItem(5, 'Haga clic en "Registrarse".');
    numberedItem(6, 'Revise su correo electrónico y confirme haciendo clic en el enlace de verificación.');
    numberedItem(7, 'Regrese a la plataforma e inicie sesión con su correo y contraseña.');
    space(3);
    noteBox('Si recibe un error de "Estudiante no encontrado", contacte a su coordinador para verificar que sus datos estén correctamente cargados en el sistema.');

    space(5);
    title('3.3 Inicio de sesión');
    numberedItem(1, 'En la pantalla de autenticación, seleccione "Estudiante".');
    numberedItem(2, 'En la pestaña "Iniciar Sesión", ingrese su correo y contraseña.');
    numberedItem(3, 'Haga clic en "Iniciar Sesión".');

    // Dashboard mockup
    doc.addPage(); y = 20;
    title('3.4 Dashboard del Estudiante');
    space(2);

    drawScreenMockup(
      'Figura 3: Dashboard del estudiante con progreso y momentos',
      [
        { type: 'header', label: 'Dashboard del Estudiante', x: 5, y: 1, w: mw() - 10, h: 8 },
        { type: 'text', label: 'Progreso general:', x: 10, y: 12, w: 0, h: 0 },
        { type: 'button', label: '█████░░░░  50%', x: 10, y: 16, w: 115, h: 5, active: true },
        { type: 'button', label: '✓ Diagnóstico', x: 10, y: 25, w: 35, h: 8, active: true },
        { type: 'button', label: '✓ Nivelatorio', x: 48, y: 25, w: 35, h: 8, active: true },
        { type: 'button', label: '▶ Encuentro 1', x: 86, y: 25, w: 35, h: 8, active: false },
        { type: 'button', label: '🔒 Encuentro 2', x: 10, y: 36, w: 35, h: 8, active: false },
        { type: 'button', label: '🔒 Encuentro 3', x: 48, y: 36, w: 35, h: 8, active: false },
        { type: 'button', label: '🔒 Encuentro 4', x: 86, y: 36, w: 35, h: 8, active: false },
      ]
    );

    body('Al iniciar sesión, accederá al Dashboard que muestra:');
    bullet('Barra de progreso: Indica en qué momento se encuentra actualmente.');
    bullet('Momentos disponibles: Los 6 momentos en orden secuencial. Solo puede acceder al siguiente al completar el anterior.');
    space(5);

    title('3.5 Momento 1 — Diagnóstico');
    numberedItem(1, 'Haga clic en "Diagnóstico" en su dashboard.');
    numberedItem(2, 'Responda las preguntas de evaluación sobre herramientas de gestión del conocimiento.');
    numberedItem(3, 'Al completar, recibirá su puntaje y podrá avanzar al siguiente momento.');
    tipBox('Lea cada pregunta cuidadosamente. No hay límite de tiempo, pero debe completar todas las preguntas para avanzar.');

    space(5);
    title('3.6 Momento 2 — Nivelatorio');
    numberedItem(1, 'Acceda al momento "Nivelatorio".');
    numberedItem(2, 'Revise el material educativo sobre: Brainstorming, Ishikawa, Pareto, DOFA, Affinity y Árbol de Problemas.');
    numberedItem(3, 'Seleccione una problemática de las disponibles.');
    numberedItem(4, 'Complete las evaluaciones de cada herramienta aplicada a la problemática.');
    numberedItem(5, 'Al aprobar todas las evaluaciones, podrá avanzar al Encuentro 1.');

    space(5);
    title('3.7 Momentos 3 a 6 — Encuentros Dialógicos');
    numberedItem(1, 'Acceda al encuentro correspondiente.');
    numberedItem(2, 'Participe en las actividades programadas.');
    numberedItem(3, 'En Encuentro 1 y 3, podrá ver el acta generada por su coordinador.');
    numberedItem(4, 'En Encuentro 4, complete su Portafolio y Caso de Estudio.');

    space(5);
    title('3.8 Cerrar sesión');
    numberedItem(1, 'Haga clic en su nombre en la esquina superior derecha.');
    numberedItem(2, 'Seleccione "Cerrar Sesión" del menú desplegable.');

    // ===== 4. COORDINADORES =====
    doc.addPage(); y = 20;
    title('4. GUÍA PARA COORDINADORES (DOCENTES)', 16);
    space(3);
    title('4.1 Requisitos previos');
    bullet('Estar registrado en la base de datos de coordinadores autorizados.');
    bullet('Contar con su correo institucional, facultad, programa y sede registrados.');
    space(5);

    title('4.2 Registro paso a paso');
    space(2);

    drawScreenMockup(
      'Figura 4: Formulario de registro de coordinador',
      [
        { type: 'header', label: 'Acceso Coordinador', x: 5, y: 1, w: mw() - 10, h: 8 },
        { type: 'button', label: 'Iniciar Sesión', x: 10, y: 10, w: 55, h: 7, active: false },
        { type: 'button', label: 'Registrarse', x: 70, y: 10, w: 55, h: 7, active: true },
        { type: 'text', label: 'Nombre Completo', x: 10, y: 22, w: 0, h: 0 },
        { type: 'input', label: 'Su nombre', x: 10, y: 26, w: 115, h: 6 },
        { type: 'text', label: 'Email', x: 10, y: 35, w: 0, h: 0 },
        { type: 'input', label: 'correo@ucundinamarca.edu.co', x: 10, y: 39, w: 55, h: 6 },
        { type: 'text', label: 'Facultad / Programa / Sede', x: 70, y: 35, w: 0, h: 0 },
        { type: 'input', label: 'Seleccione...', x: 70, y: 39, w: 55, h: 6 },
        { type: 'button', label: 'Registrarse como Coordinador', x: 25, y: 50, w: 85, h: 8, active: true },
      ]
    );

    numberedItem(1, 'Ingrese a la plataforma y haga clic en "Ir a Autenticación".');
    numberedItem(2, 'Seleccione el botón "Coordinador" (con el ícono de libro).');
    numberedItem(3, 'Haga clic en la pestaña "Registrarse".');
    numberedItem(4, 'Complete: Nombre completo, Email, Contraseña, Facultad, Programa y Sede.');
    numberedItem(5, 'Haga clic en "Registrarse como Coordinador".');
    numberedItem(6, 'Confirme su correo electrónico con el enlace de verificación.');
    numberedItem(7, 'Inicie sesión con sus credenciales.');
    space(3);
    noteBox('Los campos de Facultad, Programa y Sede se cargan dinámicamente desde la base de datos. Debe coincidir con los datos previamente cargados por el administrador.');

    space(5);
    title('4.3 Dashboard del Coordinador');
    space(2);

    // Coordinator dashboard mockup
    drawScreenMockup(
      'Figura 5: Panel principal del coordinador',
      [
        { type: 'header', label: 'Panel del Coordinador', x: 5, y: 1, w: mw() - 10, h: 8 },
        { type: 'button', label: 'Estudiantes', x: 5, y: 12, w: 25, h: 8, active: true },
        { type: 'button', label: 'Seguimiento', x: 33, y: 12, w: 25, h: 8, active: false },
        { type: 'button', label: 'Evaluaciones', x: 61, y: 12, w: 25, h: 8, active: false },
        { type: 'button', label: 'Estadísticas', x: 89, y: 12, w: 25, h: 8, active: false },
        { type: 'text', label: 'Lista de estudiantes asignados:', x: 5, y: 28, w: 0, h: 0 },
        { type: 'input', label: 'Juan Pérez — Momento 3 — 67%', x: 5, y: 33, w: 125, h: 6 },
        { type: 'input', label: 'María García — Momento 2 — 45%', x: 5, y: 41, w: 125, h: 6 },
        { type: 'input', label: 'Carlos López — Momento 5 — 90%', x: 5, y: 49, w: 125, h: 6 },
      ]
    );

    body('Al iniciar sesión, accederá al panel con las siguientes secciones:');
    space(3);

    title('4.3.1 Gestión de Estudiantes');
    bullet('Visualice la lista de estudiantes asignados a su programa.');
    bullet('Consulte el progreso individual de cada estudiante.');
    space(3);
    title('4.3.2 Seguimiento en Tiempo Real');
    bullet('Monitoree qué estudiantes están activos y en qué momento se encuentran.');
    bullet('Vea estadísticas generales de participación y completitud.');
    space(3);
    title('4.3.3 Evaluaciones');
    bullet('Revise las evaluaciones completadas por los estudiantes.');
    bullet('Asigne calificaciones y comentarios.');
    bullet('Filtre por momento, estudiante o estado de revisión.');
    space(3);
    title('4.3.4 Gestión de Actas (Encuentros 1 y 3)');
    bullet('Cree actas con: fecha, hora, lugar, director, secretario, objetivos, agenda.');
    bullet('Use el buscador para agregar asistentes por nombre.');
    bullet('Registre temas institucionales, de facultad y de programa.');
    bullet('Registre proposiciones de estudiantes y plan de mejoramiento.');
    space(3);
    title('4.3.5 Estadísticas');
    bullet('Consulte gráficas de rendimiento de sus estudiantes.');
    bullet('Compare resultados por herramienta (Brainstorming, Ishikawa, Pareto, DOFA, Affinity).');

    // ===== 5. OBSERVADORES =====
    doc.addPage(); y = 20;
    title('5. GUÍA PARA OBSERVADORES ADMINISTRATIVOS', 16);
    space(3);
    title('5.1 Requisitos previos');
    body('El acceso de Observador es asignado únicamente por el administrador. No es posible auto-registrarse.');
    space(5);
    title('5.2 Inicio de sesión');
    numberedItem(1, 'Ingrese a la plataforma y seleccione "Observador Adm.".');
    numberedItem(2, 'Ingrese las credenciales proporcionadas por el administrador.');
    numberedItem(3, 'Haga clic en "Iniciar Sesión".');
    noteBox('La pestaña de "Registrarse" está deshabilitada para este tipo de usuario.');
    space(5);
    title('5.3 Dashboard del Observador');
    body('El observador tiene acceso de solo lectura a:');
    bullet('Actividad general: Progreso de todos los estudiantes y coordinadores.');
    bullet('Estadísticas globales: Gráficas y métricas a nivel institucional.');
    bullet('Evaluaciones: Consulta sin posibilidad de edición.');

    // ===== 6. ADMINISTRADORES =====
    doc.addPage(); y = 20;
    title('6. GUÍA PARA ADMINISTRADORES', 16);
    space(3);
    title('6.1 Requisitos previos');
    body('Las credenciales de administrador son proporcionadas por el equipo técnico. No es posible auto-registrarse.');
    space(5);
    title('6.2 Inicio de sesión');
    numberedItem(1, 'Seleccione el botón "Admin" (con el ícono de escudo).');
    numberedItem(2, 'Ingrese sus credenciales.');
    numberedItem(3, 'Haga clic en "Iniciar Sesión".');
    noteBox('La pestaña de "Registrarse" está deshabilitada para administradores.');

    space(5);
    title('6.3 Dashboard del Administrador');
    space(2);

    drawScreenMockup(
      'Figura 6: Panel del administrador',
      [
        { type: 'header', label: 'Panel Administrativo', x: 5, y: 1, w: mw() - 10, h: 8 },
        { type: 'button', label: 'Importar', x: 5, y: 12, w: 20, h: 8, active: true },
        { type: 'button', label: 'Roles', x: 28, y: 12, w: 20, h: 8, active: false },
        { type: 'button', label: 'Cursos', x: 51, y: 12, w: 20, h: 8, active: false },
        { type: 'button', label: 'Docentes', x: 74, y: 12, w: 20, h: 8, active: false },
        { type: 'button', label: 'Estadísticas', x: 97, y: 12, w: 25, h: 8, active: false },
        { type: 'text', label: 'Importar archivo Excel (.xlsx):', x: 5, y: 28, w: 0, h: 0 },
        { type: 'input', label: 'Arrastra o selecciona tu archivo .xlsx', x: 5, y: 33, w: 125, h: 15 },
        { type: 'button', label: 'Importar Datos', x: 40, y: 52, w: 55, h: 8, active: true },
      ]
    );

    body('El administrador tiene acceso completo al sistema:');
    space(3);
    title('6.3.1 Importación de Datos');
    bullet('Importe archivo Excel (.xlsx) con datos de coordinadores y estudiantes.');
    bullet('Coordinadores: nombre_completo, correo, facultad, programa, sede.');
    bullet('Estudiantes: nombre_completo, documento, correo, facultad, programa, sede.');
    space(3);
    title('6.3.2 Gestión de Roles');
    bullet('Visualice usuarios registrados y sus roles actuales.');
    bullet('Asigne/modifique roles: Admin, Coordinador, Estudiante, Observador.');
    space(3);
    title('6.3.3 Gestión de Cursos (CAI)');
    bullet('Cree y administre CAI (Comunidades de Aprendizaje e Investigación).');
    bullet('Asigne coordinadores y genere códigos de acceso.');
    space(3);
    title('6.3.4 Evaluaciones y Estadísticas');
    bullet('Acceda a todas las evaluaciones del sistema.');
    bullet('Filtre por momento, coordinador, programa o estudiante.');
    bullet('Consulte estadísticas globales de uso y rendimiento.');

    // ===== 7. FAQ =====
    doc.addPage(); y = 20;
    title('7. PREGUNTAS FRECUENTES', 16);
    space(5);

    const faqs = [
      { q: '¿Qué hago si olvidé mi contraseña?', a: 'Contacte al administrador del sistema para restablecer su contraseña.' },
      { q: '¿Por qué no puedo registrarme?', a: 'Verifique que sus datos (documento, correo) estén correctamente cargados, esté seleccionando el tipo de usuario correcto, y su correo institucional sea el registrado.' },
      { q: '¿Por qué no puedo acceder al siguiente momento?', a: 'Los momentos son secuenciales. Debe completar y aprobar el anterior para desbloquear el siguiente.' },
      { q: '¿Cómo sé si mi evaluación fue aprobada?', a: 'En su dashboard verá el estado de cada evaluación. Su coordinador puede asignar calificación y comentarios.' },
      { q: '¿Quién puede crear cuentas de Observador o Admin?', a: 'Solo el Administrador del sistema puede crear y asignar estos roles.' },
      { q: '¿Cómo agrego asistentes al acta?', a: 'En la sección de participantes del acta, use el buscador: escriba el nombre, selecciónelo de la lista desplegable y se agregará automáticamente.' },
    ];

    faqs.forEach(faq => {
      checkPage(30);
      // Question with green background
      const qLines = doc.splitTextToSize(faq.q, pw - 36);
      const qH = qLines.length * 5 + 4;
      doc.setFillColor(...lightGreen as [number, number, number]);
      doc.roundedRect(14, y - 4, pw - 28, qH, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...green as [number, number, number]);
      doc.text(qLines, 18, y);
      y += qH;

      // Answer
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkGray as [number, number, number]);
      const aLines = doc.splitTextToSize(faq.a, pw - 36);
      doc.text(aLines, 18, y + 2);
      y += aLines.length * 5 + 8;
    });

    // ===== FOOTER ON ALL PAGES =====
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      // Footer line
      doc.setDrawColor(...lightGreen as [number, number, number]);
      doc.setLineWidth(0.5);
      doc.line(14, ph - 15, pw - 14, ph - 15);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...medGray as [number, number, number]);
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
