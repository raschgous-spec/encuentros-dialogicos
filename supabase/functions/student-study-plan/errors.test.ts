import { expect, test } from 'bun:test';
import { isProviderDenial } from './errors';
test('un problema de la clave de Lovable no se guarda como denegación del proveedor', () => {
  expect(isProviderDenial(403, undefined, 'LOVABLE_API_KEY is not registered for this project')).toBe(false);
  expect(isProviderDenial(403, 'lovable_api_key_not_registered', 'Configuration error')).toBe(false);
});
test('las denegaciones del proveedor son terminales, no los límites de créditos', () => {
  expect(isProviderDenial(403, 'provider_access_denied', 'Provider access denied')).toBe(true);
  expect(isProviderDenial(403, 'credit_limit_reached', 'Credit limit reached')).toBe(false);
});