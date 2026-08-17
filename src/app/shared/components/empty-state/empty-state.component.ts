import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="icon-wrap">
        @if (icon === 'patient') {
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        } @else if (icon === 'calendar') {
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        } @else if (icon === 'medication') {
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
            <path d="m8.5 8.5 7 7"></path>
          </svg>
        } @else if (icon === 'task') {
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        } @else {
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        }
      </div>

      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>

      @if (actionLabel) {
        <button type="button" class="btn btn-primary" (click)="action.emit()">
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48px 24px;
      background: var(--color-surface, #ffffff);
      border: 1px dashed var(--color-border, #cbd5e1);
      border-radius: var(--radius-xl, 16px);
      margin: 16px 0;
    }

    .icon-wrap {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--color-primary-subtle, #f0fdfa);
      color: var(--color-primary, #0d9488);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .empty-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-main, #1e293b);
      margin: 0 0 8px;
    }

    .empty-description {
      font-size: 0.88rem;
      color: var(--color-text-muted, #64748b);
      max-width: 420px;
      margin: 0 0 20px;
      line-height: 1.5;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 18px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.88rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background-color: var(--color-primary, #0d9488);
      color: #ffffff;
    }

    .btn-primary:hover {
      background-color: var(--color-primary-hover, #0f766e);
      transform: translateY(-1px);
    }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'No records found';
  @Input() description = 'There are currently no items matching your criteria.';
  @Input() icon: 'patient' | 'calendar' | 'medication' | 'task' | 'default' = 'default';
  @Input() actionLabel?: string;

  @Output() action = new EventEmitter<void>();
}
