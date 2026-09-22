import { createActionGroup, props } from '@ngrx/store';
import { Organization } from '../../models/organization.model';

export const TenantActions = createActionGroup({
  source: 'Tenant',
  events: {
    'Set Portfolio': props<{ portfolio: Organization[] }>(),
    'Select Organization': props<{ organizationId: string }>(),
  },
});
