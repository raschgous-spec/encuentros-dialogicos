import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NOMBRES, MISIONES, type ResultadoLaboratorio } from '@/components/gestor/nivelatorioTypes';

interface DatosGestor { nombre: string; correo: string; facultad: string; fecha: string; }
const INSTITUCIONAL: [number,number,number] = [22,128,61];
export async function generarPdfNivelatorioGestor(resultado: ResultadoLaboratorio, datos: DatosGestor, borrador = false) {
 const response = await fetch('/logo-udec.png'); if (!response.ok) throw new Error('No se pudo cargar el logo institucional.');
 // Read the actual image before drawing; do not rely on a not-yet-loaded Image element.
 const image = await response.blob();
 const dataUrl = await new Promise<string>((resolve,reject) => { const r=new FileReader(); r.onload=()=>typeof r.result === 'string' ? resolve(r.result) : reject(new Error('Logo no disponible')); r.onerror=()=>reject(new Error('Logo no disponible')); r.readAsDataURL(image); });
 const doc=new jsPDF();
 const header=()=>{ doc.addImage(dataUrl,'PNG',75,10,60,20); doc.setFont('helvetica','bold'); doc.setTextColor(...INSTITUCIONAL); doc.setFontSize(14); doc.text(borrador ? 'BORRADOR DE PROPOSICIÓN' : 'NIVELATORIO · LABORATORIO TRANSLOCAL MEDIT',105,40,{align:'center'}); doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.text('Universidad de Cundinamarca · Gestor del Conocimiento y el Aprendizaje',105,47,{align:'center'}); doc.setTextColor(0); };
 const table=(head:string[],body:(string|number)[][], y:number)=>{ autoTable(doc,{startY:y,head:[head],body,margin:{top:56,bottom:20},theme:'grid',headStyles:{fillColor:INSTITUCIONAL},styles:{fontSize:9,cellPadding:3},didDrawPage:header}); return (doc as jsPDF & {lastAutoTable:{finalY:number}}).lastAutoTable.finalY+8; };
 header();
 let y=table(['Datos del gestor',''],[['Nombre',datos.nombre],['Correo',datos.correo],['Facultad',datos.facultad],['Fecha del resultado',datos.fecha],['Estado',resultado.estado_certificacion],['Precisión / XP',`${resultado.precision}% / ${resultado.xp} XP`]],56);
 if(!borrador){
  y=table(['Misión / concepto','Problema translocal'],resultado.asignaciones ? resultado.asignaciones.map(a=>[`${a.mision}. ${MISIONES[a.mision-1].titulo} · ${NOMBRES[a.concepto]}`,`${a.problema.u}: ${a.problema.p}`]) : resultado.problemas.map((p,i)=>[`${i+1}. ${MISIONES[i].titulo}`,`${p.u}: ${p.p}`]),y);
  y=table(['Concepto','Intentos','Precisión','Retroalimentación'],resultado.dominio.map(d=>[`${d.categoria}: ${NOMBRES[d.concepto] || d.concepto}`,d.intentos,`${d.precision}%`,!d.completado ? 'Pendiente de desarrollar.' : d.intentos===1 ? 'Dominio demostrado sin rescate.' : 'Completado con apoyo; repasar la cápsula correspondiente.']),y);
 }
 if(y>180){doc.addPage();header();y=56;}
 const p=resultado.proposicion;
 table(['Proposición · borrador orientativo',''],[['Problema / territorio',`${p.unidad}: ${p.problema}`],['Tipo / método',`${NOMBRES[p.tipo]} / ${NOMBRES[p.metodo]}`],['Objetivo',p.objetivo],['Desarrollo',p.desarrollo],['Herramientas y acciones',p.acciones],['Seguimiento y validación',p.seguimiento],['Alcance',resultado.aprobado ? 'Insumo habilitado para revisión en el Encuentro Dialógico; no acredita ejecución de acciones institucionales.' : 'Ejercicio formativo no habilitado; requiere completar el refuerzo.']],y);
 for(let i=1;i<=doc.getNumberOfPages();i++){doc.setPage(i);doc.setFontSize(8);doc.setTextColor(100);doc.text(`CAI · Encuentros Dialógicos · Página ${i} de ${doc.getNumberOfPages()}`,105,290,{align:'center'});}
 doc.save(`${borrador?'Proposicion':'Resultados'}_Nivelatorio_MEDIT_${datos.nombre.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ_-]/g,'_')}.pdf`);
}