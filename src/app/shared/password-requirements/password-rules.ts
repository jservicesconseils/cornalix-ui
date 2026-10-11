// Doit rester aligne avec la politique Cognito (infra/dev/identity,
// aws_cognito_user_pool.identity.password_policy) -- une regle plus
// stricte ici que cote Cognito donnerait une fausse impression de
// securite ; une regle plus laxiste ferait echouer SignUp/
// ConfirmForgotPassword malgre une case verte ici.
export interface PasswordRule {
  key: string;
  labelKey: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { key: 'length', labelKey: 'passwordRequirements.length', test: (p) => p.length >= 12 },
  { key: 'uppercase', labelKey: 'passwordRequirements.uppercase', test: (p) => /[A-Z]/.test(p) },
  { key: 'lowercase', labelKey: 'passwordRequirements.lowercase', test: (p) => /[a-z]/.test(p) },
  { key: 'number', labelKey: 'passwordRequirements.number', test: (p) => /[0-9]/.test(p) },
  { key: 'symbol', labelKey: 'passwordRequirements.symbol', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
