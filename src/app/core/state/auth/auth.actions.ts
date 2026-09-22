import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AppUser } from '../../models/user.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ user: AppUser }>(),
    Logout: emptyProps(),
  },
});
