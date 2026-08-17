import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface JourneyStep {
  label: string;
  sublabel: string;
  status: 'completed' | 'current' | 'pending' | 'warning';
}

@Component({
  selector: 'app-journey-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stepper-wrapper">
      <div class="stepper-container">
        @for (step of steps; track step.label; let idx = $index; let last = $last) {
          <div class="step-item" [ngClass]="'step-' + step.status">
            <div class="step-indicator-wrapper">
              <div class="step-indicator">
                @if (step.status === 'completed') {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                } @else if (step.status === 'warning') {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                } @else {
                  <span>{{ idx + 1 }}</span>
                }
              </div>
              @if (!last) {
                <div class="step-line" [ngClass]="{'line-completed': step.status === 'completed'}"></div>
              }
            </div>

            <div class="step-content">
              <span class="step-label">{{ step.label }}</span>
              <span class="step-sublabel">{{ step.sublabel }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .stepper-wrapper {
      background: var(--color-surface, #ffffff);
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: var(--radius-lg, 12px);
      padding: 18px 24px;
      overflow-x: auto;
    }

    .stepper-container {
      display: flex;
      align-items: flex-start;
      min-width: 600px;
    }

    .step-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .step-indicator-wrapper {
      display: flex;
      align-items: center;
      position: relative;
      margin-bottom: 8px;
    }

    .step-indicator {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.82rem;
      font-weight: 700;
      background: #f1f5f9;
      color: #64748b;
      border: 2px solid #cbd5e1;
      z-index: 2;
      transition: all 0.25s ease;
      flex-shrink: 0;
    }

    .step-line {
      position: absolute;
      top: 50%;
      left: 32px;
      right: 0;
      height: 2px;
      background: #e2e8f0;
      transform: translateY(-50%);
      z-index: 1;
      transition: background 0.3s ease;
    }

    .step-line.line-completed {
      background: #0d9488;
    }

    .step-content {
      padding-right: 12px;
    }

    .step-label {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 2px;
    }

    .step-sublabel {
      display: block;
      font-size: 0.72rem;
      color: #64748b;
      line-height: 1.3;
    }

    /* Completed state */
    .step-completed .step-indicator {
      background: #0d9488;
      color: #ffffff;
      border-color: #0d9488;
    }

    /* Current state */
    .step-current .step-indicator {
      background: #0ea5e9;
      color: #ffffff;
      border-color: #0284c7;
      box-shadow: 0 0 0 4px #e0f2fe;
    }
    .step-current .step-label {
      color: #0369a1;
      font-weight: 700;
    }

    /* Warning state (e.g. Overdue follow-up) */
    .step-warning .step-indicator {
      background: #e11d48;
      color: #ffffff;
      border-color: #e11d48;
      box-shadow: 0 0 0 4px #ffe4e6;
    }
    .step-warning .step-label {
      color: #be123c;
    }
  `]
})
export class JourneyStepperComponent {
  @Input() steps: JourneyStep[] = [];
}
