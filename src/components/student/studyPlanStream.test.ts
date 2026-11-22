/// <reference types="bun" />
import { expect, test } from 'bun:test';
import { readStudyPlanStream } from './studyPlanStream';
test('conserva ejercicios y resultado guardado aunque el texto llegue dividido', async () => {
  const text = 'event: delta\ndata: {"text":"Ejercicio de Ishikawa: clasifica las causas."}\n\nevent: done\ndata: {"plan":{"id":"plan-guardado"}}\n\n';
  const bytes = new TextEncoder().encode(text);
  const body = new ReadableStream<Uint8Array>({ start(controller) { for (let i = 0; i < bytes.length; i += 7) controller.enqueue(bytes.slice(i, i + 7)); controller.close(); } });
  const events: unknown[] = [];
  await readStudyPlanStream(body, (event, data) => events.push({ event, data }));
  expect(events).toEqual([{ event: 'delta', data: { text: 'Ejercicio de Ishikawa: clasifica las causas.' } }, { event: 'done', data: { plan: { id: 'plan-guardado' } } }]);
});