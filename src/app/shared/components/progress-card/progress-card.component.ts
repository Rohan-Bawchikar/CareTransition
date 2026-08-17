import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-card">
      <div class="progress-header">
        <div class="progress-title-wrap">
          <h4 class="progress-title">{{ title }}</h4>
          @if (subtitle) {
            <p class="progress-subtitle">{{ subtitle }}</p>
          }
        </div>
        <div class="percentage-badge" [ngClass]="percentageColorClass">
          {{ percentage }}%
        </div>
      </div>

      <div class="progress-track" role="progressbar" [attr.aria-valuenow]="percentage" aria-valuemin="0" aria-valuemax="100">
        <div 
          class="progress-fill" 
          [ngClass]="percentageColorClass"
          [style.width.%]="percentage"
        ></div>
      </div>

      @if (details) {
        <div class="progress-details">
          {{ details }}
        </div>
      }
    </div>
  `,
  styles: [`
    .progress-card {
      background: var(--color-surface, #ffffff);
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: var(--radius-lg, 12px);
      padding: 16px 20px;
      box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
    }

    .progress-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .progress-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-text-main, #1e293b);
      margin: 0;
    }

    .progress-subtitle {
      font-size: 0.78rem;
      color: var(--color-text-muted, #64748b);
      margin: 2px 0 0;
    }

    .percentage-badge {
      font-size: 0.95rem;
      font-weight: 700;
      padding: 2px 10px;
      border-radius: 9999px;
    }

    .progress-track {
      width: 100%;
      height: 8px;
      background-color: var(--color-bg-subtle, #f1f5f9);
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .progress-details {
      margin-top: 10px;
      font-size: 0.78rem;
      color: var(--color-text-muted, #64748b);
      display: flex;
      justify-content: space-between;
    }

    /* Color Classes */
    .color-high {
      background-color: #0d9488;
      color: #0d9488;
    }
    .color-medium {
      background-color: #f59e0b;
      color: #b45309;
    }
    .color-low {
      background-color: #e11d48;
      color: #be123c;
    }

    .percentage-badge.color-high {
      background-color: #f0fdfa;
    }
    .percentage-badge.color-medium {
      background-color: #fffbeb;
    }
    .percentage-badge.color-low {
      background-color: #fff1f2;
    }
  `]
})
export class ProgressCardComponent {
  @Input() title = 'Recovery Progress';
  @Input() subtitle?: string;
  @Input() percentage = 0;
  @Input() details?: string;

  get percentageColorClass(): string {
    if (this.percentage >= 75) return 'color-high';
    if (this.percentage >= 40) return 'color-medium';
    return 'color-low';
  }
}
