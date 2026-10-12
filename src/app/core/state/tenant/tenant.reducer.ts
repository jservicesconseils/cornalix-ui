import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Organization } from '../../models/organization.model';
import { AuthActions } from '../auth/auth.actions';
import { TenantActions } from './tenant.actions';

export interface TenantState {
  portfolio: Organization[];
  currentOrganizationId: string | null;
}

const initialState: TenantState = {
  portfolio: [],
  currentOrganizationId: null,
};

export const tenantFeature = createFeature({
  name: 'tenant',
  reducer: createReducer(
    initialState,
    on(TenantActions.setPortfolio, (state, { portfolio }): TenantState => ({
      ...state,
      portfolio,
      currentOrganizationId: state.currentOrganizationId ?? portfolio[0]?.id ?? null,
    })),
    on(TenantActions.selectOrganization, (state, { organizationId }): TenantState => ({
      ...state,
      currentOrganizationId: organizationId,
    })),
    // Bug decouvert pendant les tests manuels : sans reset explicite ici,
    // currentOrganizationId d'un compte precedent survivait a la
    // deconnexion (setPortfolio ne l'ecrase que s'il est deja nul). Un
    // nouveau compte connecte dans le meme onglet (sans rechargement
    // complet) heritait alors d'un id d'organisation hors de son propre
    // tenant_scope -- selecteur d'organisation vide + 403 partout.
    on(AuthActions.logout, (): TenantState => initialState),
  ),
  extraSelectors: ({ selectPortfolio, selectCurrentOrganizationId }) => ({
    selectCurrentOrganization: createSelector(
      selectPortfolio,
      selectCurrentOrganizationId,
      (portfolio, currentOrganizationId) => portfolio.find((org) => org.id === currentOrganizationId) ?? null,
    ),
  }),
});
