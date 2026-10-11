import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface TrendPoint {
  date: string;
  overallScore: number | null;
}

interface PlotPoint {
  x: number;
  y: number;
  label: string;
}

// Meme approche que RadarChart (SVG inline, pas de librairie de graphes)
// -- courbe de tendance du score global dans le temps (SCRUM-47).
const WIDTH = 600;
const HEIGHT = 180;
const PADDING_X = 24;
const PADDING_Y = 20;

@Component({
  selector: 'app-trend-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (plotPoints().length >= 2) {
      <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" role="img" aria-label="Tendance du score global dans le temps">
        @for (y of gridLines(); track y) {
          <line [attr.x1]="paddingX" [attr.y1]="y" [attr.x2]="width - paddingX" [attr.y2]="y" stroke="var(--line)" stroke-width="1" />
        }

        <polyline [attr.points]="linePoints()" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />

        @for (point of plotPoints(); track $index) {
          <circle [attr.cx]="point.x" [attr.cy]="point.y" r="3.5" fill="var(--accent)" />
        }

        <text [attr.x]="plotPoints()[0].x" [attr.y]="height - 4" text-anchor="start" class="axis-label">{{ plotPoints()[0].label }}</text>
        <text [attr.x]="plotPoints()[plotPoints().length - 1].x" [attr.y]="height - 4" text-anchor="end" class="axis-label">{{ plotPoints()[plotPoints().length - 1].label }}</text>
      </svg>
    } @else {
      <p class="trend-empty">Pas encore assez de données pour afficher une tendance.</p>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    svg {
      width: 100%;
      height: auto;
    }
    .axis-label {
      font-family: var(--font-mono);
      font-size: 10px;
      fill: var(--ink-faint);
    }
    .trend-empty {
      color: var(--ink-faint);
      font-size: 13px;
      text-align: center;
      padding: 32px 0;
      margin: 0;
    }
  `,
})
export class TrendChart {
  readonly points = input.required<TrendPoint[]>();

  protected readonly width = WIDTH;
  protected readonly height = HEIGHT;
  protected readonly paddingX = PADDING_X;

  // Les points sans score exploitable (overallScore null) sont exclus du
  // trace -- un trou dans la courbe serait plus trompeur qu'utile pour
  // le peu de points qu'une tendance mensuelle/trimestrielle comporte.
  private readonly exploitablePoints = computed(() => this.points().filter((p) => p.overallScore !== null));

  protected readonly plotPoints = computed<PlotPoint[]>(() => {
    const data = this.exploitablePoints();
    if (data.length < 2) return [];

    const innerWidth = WIDTH - PADDING_X * 2;
    const innerHeight = HEIGHT - PADDING_Y * 2;

    return data.map((point, index) => ({
      x: PADDING_X + (innerWidth * index) / (data.length - 1),
      y: PADDING_Y + innerHeight * (1 - (point.overallScore ?? 0) / 100),
      label: formatDate(point.date),
    }));
  });

  protected readonly linePoints = computed(() => this.plotPoints().map((p) => `${p.x},${p.y}`).join(' '));

  protected readonly gridLines = computed(() => [PADDING_Y, HEIGHT / 2, HEIGHT - PADDING_Y]);
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year.slice(2)}`;
}
