import { Level, EvaluationResult, StudentResults } from '@/types/diagnostic';
import { diagnosticConfig } from '@/data/diagnosticConfig';

export function getFeedbackLevel(score: number): Level {
  if (score >= 85) return 'avanzado';
  if (score >= 70) return 'intermedio';
  if (score >= 50) return 'basico';
  return 'inicial';
}

export function evaluateBrainstorming(studentResults: StudentResults): EvaluationResult {
  const { correct_option_ids, max_selections } = diagnosticConfig.brainstorming;
  const student_ids = studentResults.brainstorming;
  
  let correctCount = 0;
  student_ids.forEach(id => {
    if (correct_option_ids.includes(id)) {
      correctCount++;
    }
  });
  const score = (correctCount / max_selections) * 100;
  return { name: "Brainstorming", score, level: getFeedbackLevel(score) };
}

export function evaluateAffinity(studentResults: StudentResults): EvaluationResult {
  const { items } = diagnosticConfig.affinity;
  const student_answers = studentResults.affinity;
  let correctCount = 0;
  
  items.forEach(item => {
    if (student_answers[item.id] === item.correct) {
      correctCount++;
    }
  });
  const score = (correctCount / items.length) * 100;
  return { name: "Diagrama de Afinidad", score, level: getFeedbackLevel(score) };
}

export function evaluateIshikawa(studentResults: StudentResults): EvaluationResult {
  const { causes } = diagnosticConfig.ishikawa;
  const student_answers = studentResults.ishikawa;
  let correctCount = 0;
  
  causes.forEach(cause => {
    if (student_answers[cause.id] === cause.correct) {
      correctCount++;
    }
  });
  const score = (correctCount / causes.length) * 100;
  return { name: "Diagrama de Ishikawa", score, level: getFeedbackLevel(score) };
}

export function evaluateDofa(studentResults: StudentResults): EvaluationResult {
  const { statements } = diagnosticConfig.dofa;
  const student_answers = studentResults.dofa;
  let correctCount = 0;
  
  statements.forEach(statement => {
    if (student_answers[statement.id] === statement.correct) {
      correctCount++;
    }
  });
  const score = (correctCount / statements.length) * 100;
  return { name: "Análisis DOFA", score, level: getFeedbackLevel(score) };
}

export function evaluatePareto(studentResults: StudentResults): EvaluationResult {
  const { causes } = diagnosticConfig.pareto;
  const student_answers = studentResults.pareto;
  let correctCount = 0;
  
  causes.forEach(cause => {
    if (student_answers[cause.id] === cause.correct_rank) {
      correctCount++;
    }
  });
  const score = (correctCount / causes.length) * 100;
  return { name: "Principio de Pareto", score, level: getFeedbackLevel(score) };
}

export function calculateOverallResults(studentResults: StudentResults): {
  results: EvaluationResult[];
  averageScore: number;
  overallLevel: Level;
  suggestion: string;
} {
  const results = [
    evaluateBrainstorming(studentResults),
    evaluateAffinity(studentResults),
    evaluateIshikawa(studentResults),
    evaluateDofa(studentResults),
    evaluatePareto(studentResults)
  ];

  const totalScore = results.reduce((sum, res) => sum + res.score, 0);
  const averageScore = totalScore / results.length;
  const overallLevel = getFeedbackLevel(averageScore);

  let suggestion = "";
  if (overallLevel === 'avanzado') {
    suggestion = "¡Excelente! Tienes un gran dominio. Enfócate en desarrollar liderazgo analítico.";
  } else if (overallLevel === 'intermedio') {
    suggestion = "Buen trabajo. Te recomendamos profundizar en la aplicación contextual de las herramientas.";
  } else {
    suggestion = "Tienes las bases. Te sugerimos fortalecer tu comprensión conceptual de las herramientas.";
  }

  return { results, averageScore, overallLevel, suggestion };
}

// Case Study Evaluation Functions
export function evaluateArbolProblemas(data: any): number {
  // Score based on problem tree completeness (20 points max)
  const problemaCentral = data?.problemaCentral || '';
  const causas = data?.causas || [];
  const efectos = data?.efectos || [];
  
  // Problema central defined (5 points)
  const problemaCentralScore = problemaCentral.trim().length >= 20 ? 5 : 
                                problemaCentral.trim().length >= 10 ? 3 : 
                                problemaCentral.trim().length > 0 ? 1 : 0;
  
  // Causas identified (8 points max)
  const causasScore = Math.min((causas.length / 4) * 8, 8); // 4 or more causas = full points
  
  // Efectos identified (7 points max)
  const efectosScore = Math.min((efectos.length / 3) * 7, 7); // 3 or more efectos = full points
  
  return Math.round(problemaCentralScore + causasScore + efectosScore);
}

export function evaluateCaseBrainstorming(data: any): number {
  // Score based on number of ideas (20 points max)
  const ideas = data?.ideas || [];
  const ideaCount = ideas.length;
  const ideaScore = Math.min((ideaCount / 10) * 20, 20); // 10 or more ideas = full points
  
  return Math.round(ideaScore);
}

export function evaluateCaseAffinity(data: any): number {
  // Score based on groups created (20 points max)
  const groups = data?.groups || [];
  const groupCount = groups.length;
  const groupScore = Math.min((groupCount / 4) * 10, 10); // 4 or more groups = 10 points
  
  // Check if groups have meaningful labels
  const labeledGroups = groups.filter((g: any) => g.label && g.label.trim().length > 0);
  const labelScore = Math.min((labeledGroups.length / groupCount) * 10, 10);
  
  return Math.round(groupScore + labelScore);
}

export function evaluateCaseIshikawa(data: any): number {
  // Score based on causes identified across 6M categories (20 points max)
  const categories = ['metodos', 'maquinaria', 'manoObra', 'materiales', 'medioAmbiente', 'medicion'];
  const causes = data?.causes || {};
  
  let totalCauses = 0;
  let categoriesUsed = 0;
  
  categories.forEach(category => {
    const categoryCauses = causes[category] || [];
    if (categoryCauses.length > 0) {
      categoriesUsed++;
      totalCauses += categoryCauses.length;
    }
  });
  
  const categoryScore = (categoriesUsed / 6) * 10; // Use all 6 categories = 10 points
  const causeScore = Math.min((totalCauses / 12) * 10, 10); // 12 or more causes = 10 points
  
  return Math.round(categoryScore + causeScore);
}

export function evaluateCaseDOFA(data: any): number {
  // Score based on DOFA matrix completeness (20 points max)
  const fortalezas = data?.fortalezas || [];
  const debilidades = data?.debilidades || [];
  const oportunidades = data?.oportunidades || [];
  const amenazas = data?.amenazas || [];
  
  const fScore = Math.min((fortalezas.length / 3) * 5, 5);
  const dScore = Math.min((debilidades.length / 3) * 5, 5);
  const oScore = Math.min((oportunidades.length / 3) * 5, 5);
  const aScore = Math.min((amenazas.length / 3) * 5, 5);
  
  return Math.round(fScore + dScore + oScore + aScore);
}

export function evaluateCasePareto(data: any): number {
  // Score based on causes identified with frequencies (20 points max)
  const causes = data?.causes || [];
  
  if (causes.length === 0) return 0;
  
  const causeScore = Math.min((causes.length / 5) * 10, 10); // 5 or more causes = 10 points
  
  // Check if frequencies are assigned
  const withFrequency = causes.filter((c: any) => c.frequency && c.frequency > 0);
  const frequencyScore = Math.min((withFrequency.length / causes.length) * 10, 10);
  
  return Math.round(causeScore + frequencyScore);
}

export function calculateCaseStudyScore(evaluacionData: any): {
  automaticScore: number;
  maxScore: number;
  passed: boolean;
  breakdown: Record<string, number>;
} {
  const breakdown = {
    arbolProblemas: evaluateArbolProblemas(evaluacionData.arbolProblemas),
    brainstorming: evaluateCaseBrainstorming(evaluacionData.brainstorming),
    affinity: evaluateCaseAffinity(evaluacionData.affinity),
    ishikawa: evaluateCaseIshikawa(evaluacionData.ishikawa),
    dofa: evaluateCaseDOFA(evaluacionData.dofa),
    pareto: evaluateCasePareto(evaluacionData.pareto)
  };
  
  const automaticScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);
  const maxScore = 120; // 6 tools x 20 points each
  const passed = automaticScore >= 72; // 60% of 120
  
  return { automaticScore, maxScore, passed, breakdown };
}
