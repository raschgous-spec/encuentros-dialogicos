import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper function to add logo to PDF
export const addLogoToPDF = (doc: jsPDF, yPosition: number = 10): number => {
  const logo = new Image();
  logo.src = '/logo-udec.png';
  
  try {
    // Add logo centered at the top
    const logoWidth = 60;
    const logoHeight = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const xPosition = (pageWidth - logoWidth) / 2;
    
    doc.addImage(logo, 'PNG', xPosition, yPosition, logoWidth, logoHeight);
    return yPosition + logoHeight + 10; // Return new Y position after logo
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
    return yPosition; // Return original position if error
  }
};

interface EvaluacionData {
  problematica?: string;
  dimension?: string;
  caracteristicas?: string;
  arbolProblemas?: any;
  brainstorming?: any;
  affinity?: any;
  ishikawa?: any;
  dofa?: any;
  pareto?: any;
}

interface EvaluationResult {
  automaticScore: number;
  maxScore: number;
  passed: boolean;
  breakdown: Record<string, number>;
}

export const generateCaseStudyPDF = (
  evaluacionData: EvaluacionData,
  result: EvaluationResult,
  feedback: Record<string, string>
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 10;

  // Add logo at the top
  yPosition = addLogoToPDF(doc, yPosition);

  // Título principal
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PROTOTIPO MOMENTO NIVELATORIO', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Subtítulo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Valoración de Caso de Estudio', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Sección 1: Problema Seleccionado
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. PROBLEMA SELECCIONADO', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (evaluacionData.dimension) {
    doc.text(`Dimensión/Contexto: ${evaluacionData.dimension}`, 14, yPosition);
    yPosition += 6;
  }

  if (evaluacionData.problematica) {
    const problematicaLines = doc.splitTextToSize(`Problemática: ${evaluacionData.problematica}`, pageWidth - 28);
    doc.text(problematicaLines, 14, yPosition);
    yPosition += problematicaLines.length * 6;
  }

  if (evaluacionData.caracteristicas) {
    yPosition += 3;
    const caracteristicasLines = doc.splitTextToSize(`Características: ${evaluacionData.caracteristicas}`, pageWidth - 28);
    doc.text(caracteristicasLines, 14, yPosition);
    yPosition += caracteristicasLines.length * 6;
  }

  yPosition += 10;

  // Sección 2: Resultados Generales
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. RESULTADOS GENERALES', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Puntaje Obtenido: ${result.automaticScore}/${result.maxScore}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Estado: ${result.passed ? 'APROBADO' : 'NO APROBADO'}`, 14, yPosition);
  yPosition += 10;

  // Sección 3: Resultados Detallados por Herramienta
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. RESULTADOS DETALLADOS POR HERRAMIENTA', 14, yPosition);
  yPosition += 10;

  const toolNames: Record<string, string> = {
    arbolProblemas: 'Árbol de Problemas',
    brainstorming: 'Brainstorming',
    affinity: 'Diagrama de Afinidad',
    ishikawa: 'Diagrama de Ishikawa',
    dofa: 'Matriz DOFA',
    pareto: 'Diagrama de Pareto'
  };

  // Tabla de resultados
  const tableData = Object.entries(result.breakdown).map(([key, score]) => [
    toolNames[key],
    `${score}/20`,
    feedback[key] || 'Sin retroalimentación'
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Herramienta', 'Puntaje', 'Retroalimentación']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 'auto' }
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Detalles de cada herramienta
  Object.entries(evaluacionData).forEach(([key, data]) => {
    if (['arbolProblemas', 'brainstorming', 'affinity', 'ishikawa', 'dofa', 'pareto'].includes(key) && data) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${toolNames[key]}:`, 14, yPosition);
      yPosition += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      if (key === 'arbolProblemas') {
        doc.text(`Problema Central: ${data.problemaCentral || 'N/A'}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Causas identificadas: ${data.causas?.length || 0}`, 20, yPosition);
        yPosition += 4;
        if (data.causas && data.causas.length > 0) {
          data.causas.slice(0, 3).forEach((causa: string, idx: number) => {
            const causaLines = doc.splitTextToSize(`  • ${causa}`, pageWidth - 35);
            doc.text(causaLines, 20, yPosition);
            yPosition += causaLines.length * 4.5;
          });
          if (data.causas.length > 3) {
            doc.text(`  ... y ${data.causas.length - 3} causas más`, 20, yPosition);
            yPosition += 5;
          }
        }
        yPosition += 3;
        doc.text(`Efectos identificados: ${data.efectos?.length || 0}`, 20, yPosition);
        yPosition += 4;
        if (data.efectos && data.efectos.length > 0) {
          data.efectos.slice(0, 3).forEach((efecto: string, idx: number) => {
            const efectoLines = doc.splitTextToSize(`  • ${efecto}`, pageWidth - 35);
            doc.text(efectoLines, 20, yPosition);
            yPosition += efectoLines.length * 4.5;
          });
          if (data.efectos.length > 3) {
            doc.text(`  ... y ${data.efectos.length - 3} efectos más`, 20, yPosition);
            yPosition += 5;
          }
        }
      } else if (key === 'brainstorming') {
        doc.text(`Ideas generadas: ${data.ideas?.length || 0}`, 20, yPosition);
        yPosition += 5;
        if (data.ideas && data.ideas.length > 0) {
          data.ideas.slice(0, 5).forEach((idea: string, idx: number) => {
            const ideaLines = doc.splitTextToSize(`  ${idx + 1}. ${idea}`, pageWidth - 35);
            doc.text(ideaLines, 20, yPosition);
            yPosition += ideaLines.length * 4.5;
          });
          if (data.ideas.length > 5) {
            doc.text(`  ... y ${data.ideas.length - 5} ideas más`, 20, yPosition);
            yPosition += 5;
          }
        }
      } else if (key === 'affinity') {
        doc.text(`Grupos creados: ${data.groups?.length || 0}`, 20, yPosition);
        yPosition += 5;
      } else if (key === 'ishikawa') {
        const categories = ['metodos', 'maquinaria', 'manoObra', 'materiales', 'medioAmbiente', 'medicion'];
        let totalCauses = 0;
        categories.forEach(cat => {
          totalCauses += data.causes?.[cat]?.length || 0;
        });
        doc.text(`Causas identificadas: ${totalCauses}`, 20, yPosition);
        yPosition += 5;
      } else if (key === 'dofa') {
        doc.text(`Fortalezas: ${data.fortalezas?.length || 0}`, 20, yPosition);
        yPosition += 4;
        doc.text(`Debilidades: ${data.debilidades?.length || 0}`, 20, yPosition);
        yPosition += 4;
        doc.text(`Oportunidades: ${data.oportunidades?.length || 0}`, 20, yPosition);
        yPosition += 4;
        doc.text(`Amenazas: ${data.amenazas?.length || 0}`, 20, yPosition);
        yPosition += 5;
      } else if (key === 'pareto') {
        doc.text(`Causas analizadas: ${data.causes?.length || 0}`, 20, yPosition);
        yPosition += 5;
      }

      yPosition += 5;
    }
  });

  // Sección 4: Espacio para Actas
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('4. ESPACIO PARA ACTAS', 14, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Espacio reservado para las actas de encuentros dialógicos:', 14, yPosition);
  yPosition += 10;

  // Dibujar líneas para actas
  for (let i = 0; i < 8; i++) {
    if (yPosition > 270) break;
    doc.line(14, yPosition, pageWidth - 14, yPosition);
    yPosition += 8;
  }

  // Sección 5: Plan de Mejoramiento
  doc.addPage();
  yPosition = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('5. PLAN DE MEJORAMIENTO', 14, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Espacio para desarrollar el plan de mejoramiento:', 14, yPosition);
  yPosition += 10;

  // Tabla para plan de mejoramiento
  autoTable(doc, {
    startY: yPosition,
    head: [['Objetivo', 'Acciones', 'Responsable', 'Plazo']],
    body: [
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', '']
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 5, minCellHeight: 15 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Notas adicionales
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Nota: Este documento debe ser completado y presentado en los siguientes encuentros dialógicos.', 14, yPosition);

  // Footer en todas las páginas
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount} | ENCUENTROS DIALÓGICOS - Universidad de Cundinamarca`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Guardar PDF
  doc.save('Prototipo_Momento_Nivelatorio.pdf');
};

// Function to generate consolidated improvement plan PDF
export const generateConsolidatedPlanPDF = async (
  userId: string,
  problematica: { problematica: string; dimension: string; tipo: string; unidad_regional?: string; facultad?: string; programa_academico?: string }
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 10;

  // Add logo at the top
  yPosition = addLogoToPDF(doc, yPosition);

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PLAN DE MEJORAMIENTO DIGITAL CONSOLIDADO', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('ENCUENTROS DIALÓGICOS - Universidad de Cundinamarca', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Problem Context
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PROBLEMÁTICA TRABAJADA', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dimensión/Contexto: ${problematica.dimension}`, 14, yPosition);
  yPosition += 6;
  
  const problematicaLines = doc.splitTextToSize(`Problemática: ${problematica.problematica}`, pageWidth - 28);
  doc.text(problematicaLines, 14, yPosition);
  yPosition += problematicaLines.length * 6 + 5;

  if (problematica.tipo === 'translocal' && problematica.unidad_regional) {
    doc.text(`Unidad Regional: ${problematica.unidad_regional}`, 14, yPosition);
    yPosition += 6;
    if (problematica.facultad) {
      doc.text(`Facultad: ${problematica.facultad}`, 14, yPosition);
      yPosition += 6;
    }
    if (problematica.programa_academico) {
      doc.text(`Programa Académico: ${problematica.programa_academico}`, 14, yPosition);
      yPosition += 6;
    }
  }

  yPosition += 10;

  // Fetch all actas from database
  const { supabase } = await import('@/integrations/supabase/client');
  const { data: actasData, error } = await supabase
    .from('actas_encuentro')
    .select('*')
    .eq('estudiante_id', userId)
    .in('momento', ['encuentro1', 'encuentro2', 'encuentro3', 'encuentro4'])
    .order('momento', { ascending: true });

  if (error) {
    console.error('Error fetching actas:', error);
    doc.setFontSize(12);
    doc.text('Error al cargar los datos del plan de mejoramiento', 14, yPosition);
    doc.save('plan_mejoramiento_consolidado.pdf');
    return;
  }

  if (!actasData || actasData.length === 0) {
    doc.setFontSize(12);
    doc.text('No hay datos de plan de mejoramiento disponibles', 14, yPosition);
    doc.save('plan_mejoramiento_consolidado.pdf');
    return;
  }

  // Consolidate all plan data
  const allPlanItems: any[] = [];
  const momentoNames: Record<string, string> = {
    encuentro1: 'Momento 3 - Encuentro 1',
    encuentro2: 'Momento 4 - Encuentro 2',
    encuentro3: 'Momento 5 - Encuentro 3',
    encuentro4: 'Momento 6 - Encuentro 4'
  };

  actasData.forEach(acta => {
    const planData = acta.plan_mejoramiento as any[];
    if (planData && Array.isArray(planData)) {
      planData.forEach(item => {
        allPlanItems.push({
          ...item,
          momento: momentoNames[acta.momento] || acta.momento
        });
      });
    }
  });

  if (allPlanItems.length === 0) {
    doc.setFontSize(12);
    doc.text('No hay elementos en el plan de mejoramiento', 14, yPosition);
    doc.save('plan_mejoramiento_consolidado.pdf');
    return;
  }

  // Table of all plan items
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PLAN DE MEJORAMIENTO CONSOLIDADO', 14, yPosition);
  yPosition += 10;

  const tableData = allPlanItems.map(item => [
    item.momento || '',
    item.tema || item.objetivo || '',
    item.descripcionNecesidad || item.descripcion || '',
    item.estrategia || item.accion || '',
    item.responsables || item.responsable || '',
    `${item.fechaInicial || ''} - ${item.fechaFinal || ''}`,
    item.indicadorCumplimiento || item.indicador || ''
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Momento', 'Tema/Objetivo', 'Descripción', 'Estrategia/Acción', 'Responsables', 'Periodo', 'Indicador']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 35 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 }
    },
    margin: { left: 10, right: 10 }
  });

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount} | Plan de Mejoramiento Digital Consolidado`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`plan_mejoramiento_consolidado_${new Date().toISOString().split('T')[0]}.pdf`);
};
