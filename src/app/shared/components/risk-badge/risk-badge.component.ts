import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskLevel } from '../../../core/models/risk-summary.model';

@Component({
  selector: 'app-risk-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="risk-badge" 
      [ngClass]="[
        'risk-' + (level ? level.toLowerCase() : 'low'),
        'size-' + (size || 'md')
      ]"
      [title]="tooltip || (level + ' RISK')"
    >
      @if (showIcon) {
        <span class="risk-icon" aria-hidden="true">
          @if (level === 'HIGH') {
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          } @else if (level === 'MEDIUM') {
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          } @else {
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          }
        </span>
      }
      <span class="risk-text">{{ level || 'LOW' }} RISK</span>
    </span>
  `,
  styles: [`
    .risk-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border-radius: 9999px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .size-sm {
      padding: 3px 8px;
      font-size: 0.7rem;
    }

    .size-md {
      padding: 4px 12px;
      font-size: 0.75rem;
    }

    .size-lg {
      padding: 6px 16px;
      font-size: 0.85rem;
    }

    .risk-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /* Low Risk: Teal / Emerald */
    .risk-low {
      background-color: var(--color-risk-low-bg, #ecfdf5);
      color: var(--color-risk-low-text, #047857);
      border: 1px solid var(--color-risk-low-border, #a7f3d0);
    }

    /* Medium Risk: Amber */
    .risk-medium {
      background-color: var(--color-risk-medium-bg, #fffbeb);
      color: var(--color-risk-medium-text, #b45309);
      border: 1px solid var(--color-risk-medium-border, #fde68a);
    }

    /* High Risk: Rose / Crimson */
    .risk-high {
      background-color: var(--color-risk-high-bg, #fff1f2);
      color: var(--color-risk-high-text, #be123c);
      border: 1px solid var(--color-risk-high-border, #fecdd3);
    }
  `]
})
export class RiskBadgeComponent {
  @Input() level: RiskLevel = 'LOW';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showIcon = true;
  @Input() tooltip?: string;
}
