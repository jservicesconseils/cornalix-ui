import { createFeature, createReducer, on } from '@ngrx/store';
import { AppUser } from '../../models/user.model';
import { AuthActions } from './auth.actions';

export interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialState,
    on(AuthActions.login, (state, { user }): AuthState => ({ user, isAuthenticated: true })),
    on(AuthActions.logout, (): AuthState => initialState),
  ),
});
