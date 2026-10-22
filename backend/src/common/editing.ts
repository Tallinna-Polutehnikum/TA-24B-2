export function isEditingEnabled(): boolean {
  const isProduction = process.env.NODE_ENV?.trim().toLowerCase() === 'production';
  const explicitlyAllowed = process.env.ALLOW_EDITING?.trim().toLowerCase() === 'true';

  return !isProduction && explicitlyAllowed;
}
