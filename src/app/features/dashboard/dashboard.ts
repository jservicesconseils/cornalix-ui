import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { tenantFeature } from '../../core/state/tenant/tenant.reducer';
import { DEMO_DASHBOARD } from '../../core/data/demo-data';
import { RadarChart } from '../../shared/radar-chart/radar-chart';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, RadarChart],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly store = inject(Store);

  protected readonly currentOrganization = this.store.selectSignal(tenantFeature.selectCurrentOrganization);
  protected readonly snapshot = DEMO_DASHBOARD;

  protected readonly radarData = computed(() =>
    this.snapshot.nistFunctionScores.map((f) => ({ key: f.key, label: f.label, score: f.score })),
  );

  protected readonly maxCisScore = Math.max(...this.snapshot.cisControlScores.map((c) => c.score));
}
