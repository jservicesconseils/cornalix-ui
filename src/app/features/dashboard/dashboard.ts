import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideRefreshCw, LucideTrendingUp, LucideCheck, LucideArrowRight, LucideFlag } from '@lucide/angular';

import { DEMO_DASHBOARD } from '../../core/data/demo-data';
import { RadarChart } from '../../shared/radar-chart/radar-chart';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, RadarChart, LucideRefreshCw, LucideTrendingUp, LucideCheck, LucideArrowRight, LucideFlag],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected readonly snapshot = DEMO_DASHBOARD;

  protected readonly radarData = computed(() =>
    this.snapshot.nistFunctionScores.map((f) => ({ key: f.key, label: f.label, score: f.score })),
  );

  protected readonly maxCisScore = Math.max(...this.snapshot.cisControlScores.map((c) => c.score));
}
