import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addLogoToPDF } from './pdfExport';

interface Datos { nombre: string; correo: string; facultad: string; }

const FEEDBACK_NIVEL: Record<number, { nombre: string; comp: string; alto: string; bajo: string }> = {
  1: { nombre: 'El Enigma del Método', comp: 'Métodos de investigación', alto: 'Identificas con solvencia el enfoque cuantitativo, cualitativo o mixto según la naturaleza del problema.', bajo: 'Conviene reforzar los criterios para distinguir los enfoques cuantitativo, cualitativo y mixto.' },
  2: { nombre: 'La Brújula del Proyecto', comp: 'Fases de investigación', alto: 'Comprendes el orden lógico del método científico, desde el planteamiento hasta los resultados.', bajo: 'Conviene repasar la secuencia de fases: planteamiento, marco, metodología, recolección y resultados.' },
  3: { nombre: 'El Simulador de Soluciones', comp: 'Desarrollo para la solución de problemas', alto: 'Seleccionas con acierto la matriz técnica adecuada para formular soluciones propositivas.', bajo: 'Conviene fortalecer el uso de DOFA, Pareto e Ishikawa según el tipo de problema.' },
};

export const generarPdfMedit = (res: any, datos: Datos, modulos: Record<string, { titulo: string; desc: string }>) => {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  let y = addLogoToPDF(doc, 10);

  doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.text('DIAGNÓSTICO - RETO MEDIT: EXPEDICIÓN INVESTIGATIVA', w / 2, y, { align: 'center' }); y += 7;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
  doc.text('Gestores del Conocimiento y el Aprendizaje - Informe de Resultados', w / 2, y, { align: 'center' }); y += 10;

  autoTable(doc, {
    startY: y, theme: 'grid',
    head: [['DATOS DEL GESTOR', '']],
    body: [['Nombre', datos.nombre || '-'], ['Correo', datos.correo || '-'], ['Facultad', datos.facultad || '-'], ['Fecha', new Date().toLocaleString('es-CO')]],
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.text('1. RESULTADO GLOBAL', 14, y); y += 7;
  doc.setFontSize(11); doc.setFont('helvetica', 'normal');
  doc.text(`Insignia asignada: ${res.insignia_asignada}`, 14, y); y += 6;
  doc.text(`Eficacia global: ${res.puntaje_global}%`, 14, y); y += 8;

  autoTable(doc, {
    startY: y, theme: 'grid',
    head: [['Nivel', 'Competencia', 'Puntaje', 'Retroalimentación']],
    body: [1, 2, 3].map((n) => {
      const p = Number(res.niveles?.[n]?.puntaje ?? 0);
      const f = FEEDBACK_NIVEL[n];
      return [`${n}. ${f.nombre}`, f.comp, `${p}`, p >= 70 ? f.alto : f.bajo];
    }),
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 38 }, 1: { cellWidth: 38 }, 2: { cellWidth: 18, halign: 'center' } },
    styles: { fontSize: 9 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.text('2. RUTA DE NIVELACIÓN REQUERIDA', 14, y); y += 4;
  const ruta: string[] = res.ruta_nivelatorio_requerida || [];
  autoTable(doc, {
    startY: y, theme: 'grid',
    head: [['Módulo', 'Descripción']],
    body: ruta.length ? ruta.map((m) => [modulos[m]?.titulo ?? m, modulos[m]?.desc ?? '']) : [['Sin brechas', 'Dominio metodológico completo. Puede avanzar directamente al Nivelatorio.']],
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold' } },
    styles: { fontSize: 9 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  if (y > 260) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.text('3. RECOMENDACIÓN GENERAL', 14, y); y += 7;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  const g = Number(res.puntaje_global);
  const rec = g >= 80
    ? 'Demuestra un perfil estratégico sólido. Se recomienda liderar procesos de investigación institucional y acompañar a otros gestores.'
    : g >= 55
      ? 'Posee bases metodológicas adecuadas. Se recomienda completar los módulos indicados para consolidar la aplicación de herramientas técnicas.'
      : 'Se recomienda recorrer la ruta de nivelación completa antes de avanzar, priorizando los fundamentos del método científico.';
  doc.text(doc.splitTextToSize(rec, w - 28), 14, y);

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(120);
    doc.text(`Universidad de Cundinamarca - Reto MEDIT - Página ${i} de ${pages}`, w / 2, 290, { align: 'center' });
    doc.setTextColor(0);
  }
  doc.save(`Diagnostico_MEDIT_${(datos.nombre || 'gestor').replace(/\s+/g, '_')}.pdf`);
};
