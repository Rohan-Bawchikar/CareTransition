import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FollowUpService } from '../../core/services/follow-up.service';
import { PatientService } from '../../core/services/patient.service';
import { ToastService } from '../../core/services/toast.service';
import { FollowUp, FollowUpStatus } from '../../core/models/follow-up.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { getAppCurrentDate, getLocalISODate, getOffsetISODateTime, parseLocalDate } from '../../core/utils/date-utils';

export interface FollowUpItem {
  followUp: FollowUp;
  patientName: string;
  patientCondition: string;
}

@Component({
  selector: 'app-follow-ups',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    StatusBadgeComponent,
    EmptyStateComponent,
    ConfirmationDialogComponent
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Follow-Up Appointments</h1>
          <p class="page-subtitle">Schedule and monitor clinic visits, surgical checks, and therapy milestones</p>
        </div>

        <button type="button" class="btn btn-primary" (click)="openAddModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Schedule Follow-Up</span>
        </button>
      </div>

      <!-- Filter Tabs & Search Toolbar -->
      <div class="toolbar-card">
        <div class="status-tab-group">
          <button 
            type="button" 
            class="filter-tab" 
            [class.active]="activeStatusTab === 'ALL'"
            (click)="activeStatusTab = 'ALL'"
          >
            All Appointments
            <span class="tab-count">{{ followUpService.followUps().length }}</span>
          </button>

          <button 
            type="button" 
            class="filter-tab tab-overdue" 
            [class.active]="activeStatusTab === 'overdue'"
            (click)="activeStatusTab = 'overdue'"
          >
            Overdue
            <span class="tab-count count-danger">{{ countByStatus('overdue') }}</span>
          </button>

          <button 
            type="button" 
            class="filter-tab" 
            [class.active]="activeStatusTab === 'today'"
            (click)="activeStatusTab = 'today'"
          >
            Today
            <span class="tab-count">{{ countToday() }}</span>
          </button>

          <button 
            type="button" 
            class="filter-tab" 
            [class.active]="activeStatusTab === 'upcoming'"
            (click)="activeStatusTab = 'upcoming'"
          >
            Upcoming
            <span class="tab-count">{{ countByStatus('upcoming') }}</span>
          </button>

          <button 
            type="button" 
            class="filter-tab" 
            [class.active]="activeStatusTab === 'completed'"
            (click)="activeStatusTab = 'completed'"
          >
            Completed
            <span class="tab-count">{{ countByStatus('completed') }}</span>
          </button>
        </div>

        <div class="search-box">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search by patient, title, doctor, or department..." 
            [(ngModel)]="searchQuery"
          />
        </div>
      </div>

      <!-- Follow-Up List -->
      @if (filteredFollowUps().length === 0) {
        <app-empty-state
          title="No follow-up appointments found"
          description="There are no appointments matching your selected status filter or search query."
          icon="calendar"
          actionLabel="Schedule Follow-Up"
          (action)="openAddModal()"
        ></app-empty-state>
      } @else {
        <div class="followup-cards-list">
          @for (item of filteredFollowUps(); track item.followUp.id) {
            <div class="followup-card" [class.card-overdue]="item.followUp.status === 'overdue'" [class.card-done]="item.followUp.status === 'completed'">
              <div class="date-badge">
                <span class="badge-day">{{ getDay(item.followUp.appointmentDate) }}</span>
                <span class="badge-month">{{ getMonth(item.followUp.appointmentDate) }}</span>
                <span class="badge-time">{{ getTime(item.followUp.appointmentDate) }}</span>
              </div>

              <div class="card-main">
                <div class="card-title-row">
                  <div>
                    <h3 class="appointment-title">{{ item.followUp.title }}</h3>
                    <div class="patient-tagline">
                      Patient: 
                      <a [routerLink]="['/patients', item.followUp.patientId]" class="patient-name-link">
                        <strong>{{ item.patientName }}</strong>
                      </a>
                      <span class="cond-muted">({{ item.patientCondition }})</span>
                    </div>
                  </div>
                  <app-status-badge [status]="item.followUp.status"></app-status-badge>
                </div>

                @if (item.followUp.status === 'overdue') {
                  <div class="card-overdue-alert">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>This appointment was missed and is currently <strong>OVERDUE</strong>. Contact patient or reschedule.</span>
                  </div>
                }

                <div class="card-meta-line">
                  <span class="meta-part">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {{ item.followUp.doctorName }} • {{ item.followUp.department }}
                  </span>
                  @if (item.followUp.location) {
                    <span class="meta-part">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {{ item.followUp.location }}
                    </span>
                  }
                </div>

                @if (item.followUp.notes) {
                  <p class="card-notes">{{ item.followUp.notes }}</p>
                }

                <div class="card-action-bar">
                  @if (item.followUp.status !== 'completed') {
                    <button 
                      type="button" 
                      class="btn btn-sm btn-success"
                      (click)="markAsComplete(item.followUp.id)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Mark as Completed
                    </button>
                  }

                  <div class="actions-right">
                    <button type="button" class="btn-icon" (click)="openEditModal(item.followUp)" title="Edit Appointment">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button type="button" class="btn-icon btn-icon-danger" (click)="confirmDelete(item.followUp)" title="Delete Appointment">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Add / Edit Modal -->
    @if (isModalOpen()) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)" role="presentation">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="followup-list-modal-title">
          <h3 id="followup-list-modal-title" class="modal-title">{{ editingFollowUp ? 'Edit Follow-Up Appointment' : 'Schedule New Follow-Up' }}</h3>
          <form [formGroup]="followUpForm" (ngSubmit)="saveFollowUp()" class="modal-form">
            <div class="form-group">
              <label for="flwPatSelect" class="form-label">Select Patient *</label>
              <select 
                id="flwPatSelect" 
                class="form-control" 
                [class.is-invalid]="isFieldInvalid('patientId')"
                formControlName="patientId"
              >
                <option value="" disabled>-- Select Patient --</option>
                @for (p of patientService.patients(); track p.id) {
                  <option [value]="p.id">{{ p.fullName }} ({{ p.primaryCondition }})</option>
                }
              </select>
              @if (isFieldInvalid('patientId')) {
                <span class="error-msg">Patient selection is required.</span>
              }
            </div>

            <div class="form-group">
              <label for="flwTitleInput" class="form-label">Appointment Title *</label>
              <input 
                id="flwTitleInput"
                type="text" 
                class="form-control" 
                [class.is-invalid]="isFieldInvalid('title')"
                formControlName="title" 
                placeholder="e.g. 2-Week Surgical Review & Incision Check" 
              />
              @if (isFieldInvalid('title')) {
                <span class="error-msg">Appointment title is required.</span>
              }
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="flwDateInput" class="form-label">Appointment Date & Time *</label>
                <input 
                  id="flwDateInput"
                  type="datetime-local" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid('appointmentDate')"
                  formControlName="appointmentDate" 
                />
                @if (isFieldInvalid('appointmentDate')) {
                  <span class="error-msg">Date & time is required.</span>
                }
              </div>
              <div class="form-group">
                <label for="flwDeptInput" class="form-label">Department *</label>
                <input 
                  id="flwDeptInput"
                  type="text" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid('department')"
                  formControlName="department" 
                  placeholder="e.g. Orthopedics, Cardiology" 
                />
                @if (isFieldInvalid('department')) {
                  <span class="error-msg">Department is required.</span>
                }
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="flwDocInput" class="form-label">Physician / Specialist *</label>
                <input 
                  id="flwDocInput"
                  type="text" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid('doctorName')"
                  formControlName="doctorName" 
                  placeholder="e.g. Dr. Arvind Swaminathan, Dr. Sanjay Verma" 
                />
                @if (isFieldInvalid('doctorName')) {
                  <span class="error-msg">Doctor name is required.</span>
                }
              </div>
              <div class="form-group">
                <label for="flwLocInput" class="form-label">Clinic Location / Room</label>
                <input id="flwLocInput" type="text" class="form-control" formControlName="location" placeholder="e.g. West Wing Suite 402" />
              </div>
            </div>

            <div class="form-group">
              <label for="flwStatusSelect" class="form-label">Status</label>
              <select id="flwStatusSelect" class="form-control" formControlName="status">
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div class="form-group">
              <label for="flwNotesArea" class="form-label">Clinical Notes</label>
              <textarea id="flwNotesArea" rows="2" class="form-control" formControlName="notes" placeholder="Preparation instructions or diagnostic goals..."></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="isModalOpen.set(false)">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="followUpForm.invalid">Save Appointment</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    <app-confirmation-dialog
      [isOpen]="isDeleteOpen()"
      title="Delete Follow-Up Appointment"
      [message]="'Are you sure you want to remove this appointment: ' + (deletingFollowUp?.title || '') + '?'"
      confirmText="Delete Appointment"
      cancelText="Cancel"
      [isDestructive]="true"
      (confirm)="executeDelete()"
      (cancel)="isDeleteOpen.set(false)"
    ></app-confirmation-dialog>
  `,
  styles: [`
    .page-container {
      padding: 24px 32px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
      gap: 16px;
    }

    .page-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0 0 4px;
    }

    .page-subtitle {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0;
    }

    .toolbar-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }

    .status-tab-group {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .filter-tab {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #475569;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 0.84rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
    }

    .filter-tab:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    .filter-tab.active {
      background: #0f766e;
      color: #ffffff;
      border-color: #0f766e;
    }

    .tab-count {
      font-size: 0.72rem;
      padding: 2px 6px;
      border-radius: 9999px;
      background: rgba(0, 0, 0, 0.08);
      font-weight: 700;
    }
    .filter-tab.active .tab-count {
      background: rgba(255, 255, 255, 0.25);
      color: #ffffff;
    }

    .count-danger {
      background: #fee2e2;
      color: #b91c1c;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 240px;
      max-width: 380px;
    }

    .search-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    .search-input {
      width: 100%;
      padding: 7px 12px 7px 32px;
      font-size: 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      color: #1e293b;
      outline: none;
    }
    .search-input:focus {
      border-color: #0d9488;
    }

    /* Cards List */
    .followup-cards-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .followup-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px 20px;
      display: flex;
      align-items: flex-start;
      gap: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      transition: all 0.15s ease;
    }

    .followup-card:hover {
      border-color: #cbd5e1;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .followup-card.card-overdue {
      border-left: 5px solid #e11d48;
      background: #fffbfb;
    }

    .followup-card.card-done {
      opacity: 0.8;
      background: #f8fafc;
    }

    .date-badge {
      width: 60px;
      background: #f1f5f9;
      border-radius: 10px;
      padding: 8px 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 1px solid #e2e8f0;
    }

    .card-overdue .date-badge {
      background: #fee2e2;
      border-color: #fecdd3;
      .badge-day { color: #b91c1c; }
      .badge-month { color: #dc2626; }
    }

    .badge-day {
      font-size: 1.3rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
    }

    .badge-month {
      font-size: 0.72rem;
      font-weight: 700;
      color: #0f766e;
      text-transform: uppercase;
    }

    .badge-time {
      font-size: 0.68rem;
      color: #64748b;
      margin-top: 2px;
    }

    .card-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .card-title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .appointment-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 2px;
    }

    .patient-tagline {
      font-size: 0.84rem;
      color: #475569;
    }

    .patient-name-link {
      color: #0f766e;
      text-decoration: none;
    }
    .patient-name-link:hover {
      text-decoration: underline;
    }

    .cond-muted {
      color: #64748b;
      margin-left: 4px;
    }

    .card-overdue-alert {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff1f2;
      border: 1px solid #fecdd3;
      color: #be123c;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.78rem;
      line-height: 1.4;
    }

    .card-meta-line {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 0.8rem;
      color: #475569;
    }

    .meta-part {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .card-notes {
      font-size: 0.8rem;
      color: #475569;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      padding: 8px 12px;
      border-radius: 6px;
      margin: 2px 0;
      line-height: 1.4;
    }

    .card-action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 8px;
      margin-top: 4px;
      border-top: 1px solid #f1f5f9;
    }

    .actions-right {
      display: flex;
      gap: 6px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }

    .btn-sm {
      padding: 5px 12px;
      font-size: 0.8rem;
    }

    .btn-primary {
      background: #0d9488;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #0f766e;
    }

    .btn-success {
      background: #10b981;
      color: #ffffff;
    }
    .btn-success:hover {
      background: #059669;
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
      border-color: #cbd5e1;
    }
    .btn-secondary:hover {
      background: #e2e8f0;
    }

    .btn-icon {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #64748b;
      padding: 6px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-icon:hover {
      background: #e2e8f0;
      color: #1e293b;
    }
    .btn-icon-danger:hover {
      background: #fff1f2;
      color: #e11d48;
      border-color: #fecdd3;
    }

    /* Modals */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1200;
      padding: 16px;
    }

    .modal-card {
      background: #ffffff;
      border-radius: 16px;
      width: 100%;
      max-width: 540px;
      padding: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .modal-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 16px;
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #334155;
    }

    .form-control {
      padding: 8px 12px;
      font-size: 0.86rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      color: #1e293b;
      outline: none;
    }
    .form-control:focus {
      border-color: #0d9488;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 16px;
      }
      .toolbar-card {
        flex-direction: column;
        align-items: stretch;
      }
      .search-box {
        max-width: 100%;
      }
      .followup-card {
        flex-direction: column;
        gap: 12px;
      }
      .date-badge {
        flex-direction: row;
        width: 100%;
        gap: 8px;
        padding: 6px;
      }
    }
  `]
})
export class FollowUpsComponent {
  followUpService = inject(FollowUpService);
  patientService = inject(PatientService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  activeStatusTab: 'ALL' | 'today' | 'upcoming' | 'overdue' | 'completed' = 'ALL';
  searchQuery = '';

  isModalOpen = signal(false);
  isDeleteOpen = signal(false);
  editingFollowUp?: FollowUp;
  deletingFollowUp?: FollowUp;
  followUpForm!: FormGroup;

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    const defaultDateTime = getOffsetISODateTime(3, 10, 0);

    this.followUpForm = this.fb.group({
      patientId: ['', Validators.required],
      title: ['', Validators.required],
      appointmentDate: [defaultDateTime, Validators.required],
      department: ['Orthopedics', Validators.required],
      doctorName: ['', Validators.required],
      location: [''],
      status: ['upcoming', Validators.required],
      notes: ['']
    });
  }

  readonly enrichedFollowUps = computed<FollowUpItem[]>(() => {
    const list = this.followUpService.followUps();
    const patients = this.patientService.patients();

    return list.map(followUp => {
      const p = patients.find(pat => pat.id === followUp.patientId);
      return {
        followUp,
        patientName: p ? p.fullName : 'Unknown Patient',
        patientCondition: p ? p.primaryCondition : 'General Care'
      };
    });
  });

  readonly filteredFollowUps = computed(() => {
    let items = this.enrichedFollowUps();
    const todayStr = getLocalISODate();

    // Status Tab Filter
    if (this.activeStatusTab === 'today') {
      items = items.filter(item => item.followUp.appointmentDate.startsWith(todayStr));
    } else if (this.activeStatusTab !== 'ALL') {
      items = items.filter(item => item.followUp.status === this.activeStatusTab);
    }

    // Search Query Filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      items = items.filter(item => {
        return (
          item.patientName.toLowerCase().includes(q) ||
          item.followUp.title.toLowerCase().includes(q) ||
          item.followUp.doctorName.toLowerCase().includes(q) ||
          item.followUp.department.toLowerCase().includes(q)
        );
      });
    }

    // Sort: Overdue first, then by date asc
    return [...items].sort((a, b) => {
      if (a.followUp.status === 'overdue' && b.followUp.status !== 'overdue') return -1;
      if (b.followUp.status === 'overdue' && a.followUp.status !== 'overdue') return 1;
      return parseLocalDate(a.followUp.appointmentDate).getTime() - parseLocalDate(b.followUp.appointmentDate).getTime();
    });
  });

  countByStatus(status: FollowUpStatus): number {
    return this.followUpService.followUps().filter(f => f.status === status).length;
  }

  countToday(): number {
    const todayStr = getLocalISODate();
    return this.followUpService.followUps().filter(f => f.appointmentDate.startsWith(todayStr)).length;
  }

  isFieldInvalid(fieldName: string): boolean {
    const ctrl = this.followUpForm.get(fieldName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getDay(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return parseLocalDate(dateStr).getDate().toString();
    } catch {
      return '';
    }
  }

  getMonth(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return parseLocalDate(dateStr).toLocaleString(undefined, { month: 'short' });
    } catch {
      return '';
    }
  }

  getTime(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return parseLocalDate(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  openAddModal(): void {
    this.editingFollowUp = undefined;
    const firstPat = this.patientService.patients()[0];
    const defaultDateTime = getOffsetISODateTime(3, 10, 0);

    this.followUpForm.reset({
      patientId: firstPat ? firstPat.id : '',
      title: '',
      appointmentDate: defaultDateTime,
      department: firstPat ? (firstPat.department || 'Outpatient Clinic') : 'Clinic',
      doctorName: firstPat ? firstPat.assignedDoctor : 'Attending Physician',
      location: '',
      status: 'upcoming',
      notes: ''
    });
    this.isModalOpen.set(true);
  }

  openEditModal(f: FollowUp): void {
    this.editingFollowUp = f;
    this.followUpForm.patchValue({
      patientId: f.patientId,
      title: f.title,
      appointmentDate: f.appointmentDate,
      department: f.department,
      doctorName: f.doctorName,
      location: f.location || '',
      status: f.status,
      notes: f.notes || ''
    });
    this.isModalOpen.set(true);
  }

  saveFollowUp(): void {
    if (this.followUpForm.invalid) {
      this.followUpForm.markAllAsTouched();
      return;
    }
    const formVal = this.followUpForm.value;

    if (this.editingFollowUp) {
      this.followUpService.updateFollowUp(this.editingFollowUp.id, formVal);
      this.toastService.success('Follow-Up Updated', `${formVal.title} updated.`);
    } else {
      this.followUpService.addFollowUp(formVal);
      this.toastService.success('Follow-Up Scheduled', `${formVal.title} added.`);
    }
    this.isModalOpen.set(false);
  }

  markAsComplete(id: string): void {
    this.followUpService.markCompleted(id);
    this.toastService.success('Appointment Completed', 'Follow-up appointment marked as attended.');
  }

  confirmDelete(f: FollowUp): void {
    this.deletingFollowUp = f;
    this.isDeleteOpen.set(true);
  }

  executeDelete(): void {
    if (!this.deletingFollowUp) return;
    this.followUpService.deleteFollowUp(this.deletingFollowUp.id);
    this.toastService.info('Appointment Removed', 'Follow-up removed.');
    this.isDeleteOpen.set(false);
    this.deletingFollowUp = undefined;
  }

  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.isModalOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.isModalOpen.set(false);
    this.isDeleteOpen.set(false);
  }
}
