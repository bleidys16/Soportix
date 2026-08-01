import { Component, ElementRef, ViewChild, AfterViewInit, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  standalone: true,
  template: `
    <div class="chart-container">
      <canvas #canvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container { position: relative; width: 100%; height: 300px; }
  `],
})
export class ChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() type: 'bar' | 'doughnut' | 'line' = 'bar';
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() label = '';
  @Input() colors: string[] = [];
  @Input() horizontal = false;

  private chart: Chart | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.chart) {
      this.update();
    }
  }

  private render(): void {
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const dataset: ChartData = this.buildData();

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: this.horizontal ? 'y' : 'x',
      plugins: {
        legend: {
          display: this.type === 'doughnut',
          position: 'bottom',
        },
      },
      scales: this.type === 'doughnut' || this.type === 'line' ? {} : {
        x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 } },
        y: { beginAtZero: true, ticks: { precision: 0 } },
      },
    };

    this.chart = new Chart(ctx, {
      type: this.type,
      data: dataset,
      options,
    });
  }

  private buildData(): ChartData {
    if (this.type === 'bar' || this.type === 'line') {
      return {
        labels: this.labels,
        datasets: [{
          label: this.label,
          data: this.data,
          backgroundColor: this.colors.length ? this.colors : ['#3f51b5'],
          borderColor: this.colors.length ? this.colors[0] : '#3f51b5',
          borderWidth: 1,
          ...(this.type === 'line' ? { tension: 0.3, fill: false } : {}),
        }],
      };
    }

    return {
      labels: this.labels,
      datasets: [{
        label: this.label,
        data: this.data,
        backgroundColor: this.colors.length ? this.colors : ['#4caf50', '#ff9800', '#9e9e9e'],
        borderWidth: 1,
      }],
    };
  }

  private update(): void {
    if (!this.chart) return;
    const data = this.buildData();
    this.chart.data = data;
    this.chart.update();
  }
}
