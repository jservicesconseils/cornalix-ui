import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Organization } from '../../models/organization.model';
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
  ),
  extraSelectors: ({ selectPortfolio, selectCurrentOrganizationId }) => ({
    selectCurrentOrganization: createSelector(
      selectPortfolio,
      selectCurrentOrganizationId,
      (portfolio, currentOrganizationId) => portfolio.find((org) => org.id === currentOrganizationId) ?? null,
    ),
  }),
});
