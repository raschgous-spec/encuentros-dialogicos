/**
 * Extracts plan de mejoramiento items from the stored JSONB format.
 * Handles both:
 * - Old format: { 0: item, 1: item, tituloProyecto: ... } (array spread into object)
 * - New format: { planMejoramiento: [item1, item2], tituloProyecto: ... }
 * - Direct array: [item1, item2]
 */
export function extractPlanItems(plan: any): any[] {
  if (!plan) return [];
  if (Array.isArray(plan)) return plan;
  if (plan.planMejoramiento && Array.isArray(plan.planMejoramiento)) return plan.planMejoramiento;
  
  // Handle old format: numeric keys from array spread
  const numericKeys = Object.keys(plan).filter(k => !isNaN(Number(k)));
  if (numericKeys.length > 0) {
    return numericKeys
      .sort((a, b) => Number(a) - Number(b))
      .map(k => plan[k])
      .filter(item => item && typeof item === 'object' && 'tema' in item);
  }
  
  return [];
}

/**
 * Builds the plan_mejoramiento JSONB object for saving to database.
 * Always stores items under 'planMejoramiento' key as a proper array.
 */
export function buildPlanPayload(data: {
  planMejoramiento: any[];
  tituloProyecto?: string;
  propositoGeneral?: string;
  objetivoGeneral?: string;
  objetivosEspecificos?: any[];
  indicadoresLogro?: any[];
  seguimiento?: string;
}): Record<string, any> {
  return {
    planMejoramiento: data.planMejoramiento,
    tituloProyecto: data.tituloProyecto || '',
    propositoGeneral: data.propositoGeneral || '',
    objetivoGeneral: data.objetivoGeneral || '',
    objetivosEspecificos: data.objetivosEspecificos || [],
    indicadoresLogro: data.indicadoresLogro || [],
    seguimiento: data.seguimiento || '',
  };
}
