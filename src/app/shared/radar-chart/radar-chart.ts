import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface RadarAxis {
  key: string;
  label: string;
  score: number;
}

interface Point {
  x: number;
  y: number;
}

const SIZE = 460;
const CENTER: Point = { x: SIZE / 2, y: SIZE / 2 };
const MAX_RADIUS = 100;
const LABEL_RATIO = 1.2;
const RING_STEPS = [1, 0.66, 0.33];

@Component({
  selector: 'app-radar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.viewBox]="'0 0 ' + size + ' ' + size" role="img" aria-label="Score par fonction NIST CSF 2.0">
      @for (ring of ringPolygons(); track $index) {
        <polygon [attr.points]="ring" fill="none" stroke="var(--line)" stroke-width="1" />
      }
      @for (axis of axisLines(); track $index) {
        <line
          [attr.x1]="center.x"
          [attr.y1]="center.y"
          [attr.x2]="axis.x"
          [attr.y2]="axis.y"
          stroke="var(--line)"
          stroke-width="1"
        />
      }

      @if (secondaryScore(); as secondary) {
        <polygon [attr.points]="secondaryPolygon()" fill="none" stroke="var(--ink-faint)" stroke-width="1.5" stroke-dasharray="4 3" />
      }

      <polygon [attr.points]="primaryPolygon()" fill="var(--accent-soft)" fill-opacity="0.55" stroke="var(--accent)" stroke-width="2" />

      @for (label of axisLabels(); track label.key) {
        <text
          [attr.x]="label.x"
          [attr.y]="label.y"
          [attr.text-anchor]="label.anchor"
          class="axis-label"
        >{{ label.text }}</text>
      }
    </svg>
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
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: 500;
      fill: #344054;
    }
  `,
})
export class RadarChart {
  readonly data = input.required<RadarAxis[]>();
  readonly secondaryScore = input<number | undefined>(undefined);

  protected readonly size = SIZE;
  protected readonly center = CENTER;

  private readonly angleFor = (index: number, total: number): number => -90 + (360 / total) * index;

  private readonly pointAt = (angleDeg: number, radiusRatio: number): Point => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: CENTER.x + Math.cos(angleRad) * MAX_RADIUS * radiusRatio,
      y: CENTER.y + Math.sin(angleRad) * MAX_RADIUS * radiusRatio,
    };
  };

  protected readonly ringPolygons = computed(() => {
    const total = this.data().length;
    return RING_STEPS.map((ratio) =>
      Array.from({ length: total }, (_, i) => this.pointAt(this.angleFor(i, total), ratio))
        .map((p) => `${p.x},${p.y}`)
        .join(' '),
    );
  });

  protected readonly axisLines = computed(() => {
    const total = this.data().length;
    return Array.from({ length: total }, (_, i) => this.pointAt(this.angleFor(i, total), 1));
  });

  protected readonly primaryPolygon = computed(() => {
    const axes = this.data();
    return axes
      .map((axis, i) => this.pointAt(this.angleFor(i, axes.length), Math.max(0, Math.min(100, axis.score)) / 100))
      .map((p) => `${p.x},${p.y}`)
      .join(' ');
  });

  protected readonly secondaryPolygon = computed(() => {
    const axes = this.data();
    const secondary = this.secondaryScore() ?? 0;
    return axes
      .map((_, i) => this.pointAt(this.angleFor(i, axes.length), Math.max(0, Math.min(100, secondary)) / 100))
      .map((p) => `${p.x},${p.y}`)
      .join(' ');
  });

  protected readonly axisLabels = computed(() => {
    const axes = this.data();
    return axes.map((axis, i) => {
      const angle = this.angleFor(i, axes.length);
      const point = this.pointAt(angle, LABEL_RATIO);
      const anchor = Math.abs(Math.cos((angle * Math.PI) / 180)) < 0.2 ? 'middle' : Math.cos((angle * Math.PI) / 180) > 0 ? 'start' : 'end';
      return { key: axis.key, text: `${axis.label} ${axis.score}%`, x: point.x, y: point.y, anchor };
    });
  });
}
