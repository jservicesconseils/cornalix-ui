import { Component, computed, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PASSWORD_RULES } from './password-rules';

@Component({
  selector: 'app-password-requirements',
  imports: [TranslateModule],
  templateUrl: './password-requirements.html',
  styleUrl: './password-requirements.scss',
})
export class PasswordRequirements {
  readonly password = input('');

  protected readonly checks = computed(() => {
    const value = this.password();
    return PASSWORD_RULES.map((rule) => ({ key: rule.key, labelKey: rule.labelKey, met: rule.test(value) }));
  });
}
