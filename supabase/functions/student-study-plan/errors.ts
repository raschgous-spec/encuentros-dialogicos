export function isProviderDenial(status: number, type: string | undefined, message: string) {
  if (status !== 403) return false;
  if (/LOVABLE_API_KEY.*(not registered|invalid|missing)/i.test(message)) return false;
  return !['credit_limit_reached', 'ai_disabled', 'provider_not_available_in_region', 'model_requires_retention_consent', 'model_vendor_not_enabled', 'lovable_api_key_not_registered', 'unauthorized'].includes(type || '');
}