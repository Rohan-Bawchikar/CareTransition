import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [ngClass]="['status-' + normalizedStatus, 'size-' + (size || 'md')]">
      <span class="status-dot"></span>
      <span class="status-label">{{ displayLabel }}</span>
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      border-radius: 9999px;
      white-space: nowrap;
      text-transform: capitalize;
    }

    .size-sm {
      padding: 2px 8px;
      font-size: 0.72rem;
    }

    .size-md {
      padding: 3px 10px;
      font-size: 0.8rem;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: currentColor;
    }

    /* Active */
    .status-active {
      background-color: #f0fdf4;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }

    /* Completed */
    .status-completed {
      background-color: #f8fafc;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    /* Attention Needed / Overdue */
    .status-attention_needed,
    .status-overdue {
      background-color: #fff1f2;
      color: #e11d48;
      border: 1px solid #fecdd3;
    }

    /* Upcoming */
    .status-upcoming {
      background-color: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
    }

    /* Discontinued / Cancelled */
    .status-discontinued,
    .status-cancelled {
      background-color: #f1f5f9;
      color: #64748b;
      border: 1px solid #cbd5e1;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status = 'active';
  @Input() label?: string;
  @Input() size: 'sm' | 'md' = 'md';

  get normalizedStatus(): string {
    return (this.status || 'active').toLowerCase().replace(/\s+/g, '_');
  }

  get displayLabel(): string {
    if (this.label) return this.label;
    if (this.status === 'attention_needed') return 'Attention Needed';
    return this.status.charAt(0).toUpperCase() + this.status.slice(1);
  }
}
