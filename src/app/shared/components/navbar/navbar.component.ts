import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { MedicationService } from '../../../core/services/medication.service';
import { FollowUpService } from '../../../core/services/follow-up.service';
import { RecoveryTaskService } from '../../../core/services/recovery-task.service';
import { DischargePlanService } from '../../../core/services/discharge-plan.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmationDialogComponent],
  template: `
    <header class="app-navbar">
      <div class="navbar-left">
        <button 
          type="button" 
          class="menu-toggle-btn" 
          (click)="toggleSidebar.emit()"
          aria-label="Toggle navigation menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div class="header-tagline">
          <span class="tagline-pill">Post-Acute Care Management</span>
        </div>
      </div>

      <div class="navbar-right">
        <!-- Reset Demo Data Action -->
        <button 
          type="button" 
          class="btn btn-outline" 
          (click)="showResetConfirm.set(true)"
          title="Restore original fictional clinical demo data"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M8 16H3v5"></path>
          </svg>
          <span class="btn-text">Reset Demo Data</span>
        </button>

        <!-- Quick Add Patient Button -->
        <button 
          type="button" 
          class="btn btn-primary"
          (click)="onAddPatientClick()"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>New Patient</span>
        </button>

        <!-- Care Team Coordinator Profile Mock -->
        <div class="user-profile">
          <div class="avatar-circle">
            <span>CT</span>
          </div>
          <div class="user-meta">
            <span class="user-name">Discharge Care Team</span>
            <span class="user-role">Coordinator View</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Reset Demo Confirmation Dialog -->
    <app-confirmation-dialog
      [isOpen]="showResetConfirm()"
      title="Reset Clinical Demo Data?"
      message="This will restore all fictional patients, follow-ups, medications, and recovery checklists back to the original demo dataset."
      confirmText="Reset Data"
      cancelText="Cancel"
      [isDestructive]="false"
      (confirm)="confirmResetData()"
      (cancel)="showResetConfirm.set(false)"
    ></app-confirmation-dialog>
  `,
  styles: [`
    .app-navbar {
      height: 64px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 90;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .menu-toggle-btn {
      display: none;
      background: none;
      border: 1px solid #e2e8f0;
      color: #334155;
      padding: 6px;
      border-radius: 8px;
      cursor: pointer;
    }

    .tagline-pill {
      font-size: 0.75rem;
      font-weight: 600;
      color: #0d9488;
      background: #f0fdfa;
      border: 1px solid #ccfbf1;
      padding: 4px 12px;
      border-radius: 9999px;
      letter-spacing: 0.02em;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .btn-outline {
      background: #ffffff;
      color: #475569;
      border-color: #cbd5e1;
    }
    .btn-outline:hover {
      background: #f8fafc;
      color: #0f172a;
      border-color: #94a3b8;
    }

    .btn-primary {
      background: #0d9488;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #0f766e;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-left: 10px;
      border-left: 1px solid #e2e8f0;
    }

    .avatar-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #0f766e;
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(15, 118, 110, 0.2);
    }

    .user-meta {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.82rem;
      font-weight: 600;
      color: #1e293b;
      line-height: 1.2;
    }

    .user-role {
      font-size: 0.7rem;
      color: #64748b;
    }

    @media (max-width: 1024px) {
      .menu-toggle-btn {
        display: flex;
      }
    }

    @media (max-width: 768px) {
      .user-meta, .btn-text, .tagline-pill {
        display: none;
      }
      .app-navbar {
        padding: 0 16px;
      }
    }
  `]
})
export class NavbarComponent {
  private router = inject(Router);
  private patientService = inject(PatientService);
  private medicationService = inject(MedicationService);
  private followUpService = inject(FollowUpService);
  private taskService = inject(RecoveryTaskService);
  private dischargePlanService = inject(DischargePlanService);
  private toastService = inject(ToastService);

  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() openNewPatient = new EventEmitter<void>();

  showResetConfirm = signal(false);

  onAddPatientClick(): void {
    // Navigate to patients page and trigger modal, or route
    this.router.navigate(['/patients'], { queryParams: { action: 'new' } });
  }

  confirmResetData(): void {
    this.patientService.resetToDefaults();
    this.medicationService.resetToDefaults();
    this.followUpService.resetToDefaults();
    this.taskService.resetToDefaults();
    this.dischargePlanService.resetToDefaults();
    this.showResetConfirm.set(false);
    this.toastService.success('Demo Data Reset', 'Fictional demo data has been restored to default.');
  }
}
