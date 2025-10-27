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
