import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedicationService } from '../../core/services/medication.service';
import { PatientService } from '../../core/services/patient.service';
import { ToastService } from '../../core/services/toast.service';
import { Medication, MedicationStatus } from '../../core/models/medication.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { getLocalISODate } from '../../core/utils/date-utils';

export interface EnrichedMedicationItem {
  medication: Medication;
  patientName: string;
  patientCondition: string;
}

@Component({
  selector: 'app-medications',
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
          <h1 class="page-title">Medication Regimens</h1>
          <p class="page-subtitle">Monitor post-acute drug therapies, dosage frequencies, and adherence schedules</p>
        </div>

        <button type="button" class="btn btn-primary" (click)="openAddModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add Medication</span>
        </button>
      </div>

      <!-- Toolbar -->
      <div class="toolbar-card">
        <div class="tab-group">
          <button 
            type="button" 
            class="filter-tab" 
            [class.active]="statusFilter === 'ALL'"
            (click)="statusFilter = 'ALL'"
          >
            All Medications
            <span class="tab-count">{{ medService.medications().length }}</span>
          </button>
          <button 
            type="button" 
            class="filter-tab" 
            [class.active]="statusFilter === 'active'"
            (click)="statusFilter = 'active'"
          >
            Active Regimens
            <span class="tab-count">{{ countByStatus('active') }}</span>
          </button>
          <button 
            type="button" 
            class="filter-tab" 
            [class.active]="statusFilter === 'completed'"
            (click)="statusFilter = 'completed'"
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
            placeholder="Search by drug name or patient..." 
            [(ngModel)]="searchQuery"
          />
        </div>
      </div>

      <!-- Medications Grid -->
      @if (filteredMedications().length === 0) {
        <app-empty-state
          title="No medications found"
          description="There are no medications matching your current search or status filter."
          icon="medication"
          actionLabel="Add Medication"
          (action)="openAddModal()"
        ></app-empty-state>
      } @else {
        <div class="medications-grid">
          @for (item of filteredMedications(); track item.medication.id) {
            <div class="med-card" [class.med-completed]="item.medication.status === 'completed'">
              <div class="med-header">
                <div class="med-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
                    <path d="m8.5 8.5 7 7"></path>
                  </svg>
                </div>
                <div class="med-name-wrap">
                  <h3 class="med-name">{{ item.medication.name }}</h3>
                  <span class="med-dosage">{{ item.medication.dosage }}</span>
                </div>
                <app-status-badge [status]="item.medication.status" size="sm"></app-status-badge>
              </div>

              <div class="med-patient-row">
                <span class="lbl">Patient:</span>
                <a [routerLink]="['/patients', item.medication.patientId]" class="patient-link">
                  {{ item.patientName }}
                </a>
                <span class="sub-cond">({{ item.patientCondition }})</span>
              </div>

              <div class="med-details-body">
                <div class="detail-row">
                  <span class="lbl">Frequency:</span>
                  <span class="val">{{ item.medication.frequency }}</span>
                </div>
                <div class="detail-row">
                  <span class="lbl">Course:</span>
                  <span class="val">{{ item.medication.startDate }} → {{ item.medication.endDate }}</span>
                </div>
                @if (item.medication.instructions) {
                  <div class="instructions-box">
                    {{ item.medication.instructions }}
                  </div>
                }
              </div>

              <div class="card-bottom">
                <button 
                  type="button" 
                  class="btn-status-toggle" 
                  (click)="toggleStatus(item.medication.id)"
                >
                  {{ item.medication.status === 'active' ? 'Mark Completed' : 'Reactivate' }}
                </button>

                <div class="action-buttons">
                  <button type="button" class="btn-icon" (click)="openEditModal(item.medication)" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button type="button" class="btn-icon btn-icon-danger" (click)="confirmDelete(item.medication)" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
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
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="med-list-modal-title">
          <h3 id="med-list-modal-title" class="modal-title">{{ editingMed ? 'Edit Medication Regimen' : 'Add Medication Regimen' }}</h3>
          <form [formGroup]="medForm" (ngSubmit)="saveMedication()" class="modal-form">
            <div class="form-group">
              <label for="medPatSelect" class="form-label">Select Patient *</label>
              <select 
                id="medPatSelect"
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
              <label for="medNameInp" class="form-label">Medication Name *</label>
              <input 
                id="medNameInp"
                type="text" 
                class="form-control" 
                [class.is-invalid]="isFieldInvalid('name')"
                formControlName="name" 
                placeholder="e.g. Clexane 40mg, Dolo 650, Pan-40, Betaloc 50" 
              />
              @if (isFieldInvalid('name')) {
                <span class="error-msg">Medication name is required.</span>
              }
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="medDosageInp" class="form-label">Dosage *</label>
                <input 
                  id="medDosageInp"
                  type="text" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid('dosage')"
                  formControlName="dosage" 
                  placeholder="e.g. 40 mg, 500 mg" 
                />
                @if (isFieldInvalid('dosage')) {
                  <span class="error-msg">Dosage is required.</span>
                }
              </div>
              <div class="form-group">
                <label for="medFreqInp" class="form-label">Frequency *</label>
                <input 
                  id="medFreqInp"
                  type="text" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid('frequency')"
                  formControlName="frequency" 
                  placeholder="e.g. Once daily, Twice daily" 
                />
                @if (isFieldInvalid('frequency')) {
                  <span class="error-msg">Frequency is required.</span>
                }
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="medStartInp" class="form-label">Start Date *</label>
                <input 
                  id="medStartInp"
                  type="date" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid('startDate')"
                  formControlName="startDate" 
                />
                @if (isFieldInvalid('startDate')) {
                  <span class="error-msg">Start date is required.</span>
                }
              </div>
              <div class="form-group">
                <label for="medEndInp" class="form-label">End Date *</label>
                <input 
                  id="medEndInp"
                  type="date" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid('endDate')"
                  formControlName="endDate" 
                />
                @if (isFieldInvalid('endDate')) {
                  <span class="error-msg">End date is required.</span>
                }
              </div>
            </div>

            <div class="form-group">
              <label for="medStatusInp" class="form-label">Status</label>
              <select id="medStatusInp" class="form-control" formControlName="status">
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            <div class="form-group">
              <label for="medInstructInp" class="form-label">Administration Instructions</label>
              <textarea id="medInstructInp" rows="2" class="form-control" formControlName="instructions" placeholder="Take with food, inject subcutaneously..."></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="isModalOpen.set(false)">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="medForm.invalid">Save Medication</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    <app-confirmation-dialog
      [isOpen]="isDeleteOpen()"
      title="Delete Medication"
      [message]="'Are you sure you want to remove ' + (deletingMed?.name || 'this medication') + '?'"
      confirmText="Delete Medication"
      cancelText="Cancel"
      [isDestructive]="true"
      (confirm)="executeDelete()"
      (cancel)="isDeleteOpen.set(false)"
    ></app-confirmation-dialog>
  `,
  styles: [`
    .page-container {
      padding: 24px 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
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

    .tab-group {
      display: flex;
      gap: 6px;
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
      color: #0f172a;
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

    .search-box {
      position: relative;
      width: 280px;
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
      padding: 7px 10px 7px 32px;
      font-size: 0.84rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      outline: none;
    }
    .search-input:focus {
      border-color: #0d9488;
    }

    /* Grid */
    .medications-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 16px;
    }

    .med-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      transition: all 0.15s ease;
    }

    .med-card:hover {
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }

    .med-card.med-completed {
      opacity: 0.75;
      background: #f8fafc;
    }

    .med-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .med-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #f0fdfa;
      color: #0d9488;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .med-name-wrap {
      flex: 1;
    }

    .med-name {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .med-dosage {
      font-size: 0.8rem;
      font-weight: 600;
      color: #0f766e;
    }

    .med-patient-row {
      font-size: 0.82rem;
      color: #475569;
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 4px 0;
      border-top: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
    }

    .patient-link {
      color: #0f766e;
      font-weight: 600;
      text-decoration: none;
    }
    .patient-link:hover {
      text-decoration: underline;
    }

    .sub-cond {
      color: #64748b;
      font-size: 0.76rem;
    }

    .med-details-body {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.82rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
    }

    .lbl {
      color: #64748b;
    }
    .val {
      font-weight: 600;
      color: #1e293b;
    }

    .instructions-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 0.78rem;
      color: #475569;
      line-height: 1.4;
      margin-top: 4px;
    }

    .card-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 8px;
      border-top: 1px solid #f1f5f9;
    }

    .btn-status-toggle {
      background: none;
      border: none;
      color: #0f766e;
      font-size: 0.84rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }
    .btn-status-toggle:hover {
      text-decoration: underline;
    }

    .action-buttons {
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

    .btn-primary {
      background: #0d9488;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #0f766e;
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

    /* Modal Form Styles */
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
      max-width: 520px;
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
        width: 100%;
      }
      .medications-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MedicationsComponent {
  medService = inject(MedicationService);
  patientService = inject(PatientService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  statusFilter: 'ALL' | MedicationStatus = 'ALL';
  searchQuery = '';

  isModalOpen = signal(false);
  isDeleteOpen = signal(false);
  editingMed?: Medication;
  deletingMed?: Medication;
  medForm!: FormGroup;

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    const todayStr = getLocalISODate();
    this.medForm = this.fb.group({
      patientId: ['', Validators.required],
      name: ['', Validators.required],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      startDate: [todayStr, Validators.required],
      endDate: [todayStr, Validators.required],
      status: ['active', Validators.required],
      instructions: ['']
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const ctrl = this.medForm.get(fieldName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  readonly enrichedMedications = computed<EnrichedMedicationItem[]>(() => {
    const list = this.medService.medications();
    const patients = this.patientService.patients();

    return list.map(med => {
      const p = patients.find(pat => pat.id === med.patientId);
      return {
        medication: med,
        patientName: p ? p.fullName : 'Unknown Patient',
        patientCondition: p ? p.primaryCondition : 'General'
      };
    });
  });

  readonly filteredMedications = computed(() => {
    let items = this.enrichedMedications();

    if (this.statusFilter !== 'ALL') {
      items = items.filter(item => item.medication.status === this.statusFilter);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      items = items.filter(item => {
        return (
          item.medication.name.toLowerCase().includes(q) ||
          item.patientName.toLowerCase().includes(q) ||
          (item.medication.instructions && item.medication.instructions.toLowerCase().includes(q))
        );
      });
    }

    return items;
  });

  countByStatus(status: MedicationStatus): number {
    return this.medService.medications().filter(m => m.status === status).length;
  }

  toggleStatus(id: string): void {
    const updated = this.medService.toggleMedicationStatus(id);
    if (updated) {
      this.toastService.info('Medication Status', `${updated.name} is now ${updated.status}.`);
    }
  }

  openAddModal(): void {
    this.editingMed = undefined;
    const firstPat = this.patientService.patients()[0];
    const todayStr = getLocalISODate();

    this.medForm.reset({
      patientId: firstPat ? firstPat.id : '',
      name: '',
      dosage: '',
      frequency: '',
      startDate: todayStr,
      endDate: todayStr,
      status: 'active',
      instructions: ''
    });
    this.isModalOpen.set(true);
  }

  openEditModal(m: Medication): void {
    this.editingMed = m;
    this.medForm.patchValue({
      patientId: m.patientId,
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      startDate: m.startDate,
      endDate: m.endDate,
      status: m.status,
      instructions: m.instructions || ''
    });
    this.isModalOpen.set(true);
  }

  saveMedication(): void {
    if (this.medForm.invalid) {
      this.medForm.markAllAsTouched();
      return;
    }
    const formVal = this.medForm.value;

    if (this.editingMed) {
      this.medService.updateMedication(this.editingMed.id, formVal);
      this.toastService.success('Medication Updated', `${formVal.name} updated.`);
    } else {
      this.medService.addMedication(formVal);
      this.toastService.success('Medication Added', `${formVal.name} added.`);
    }
    this.isModalOpen.set(false);
  }

  confirmDelete(m: Medication): void {
    this.deletingMed = m;
    this.isDeleteOpen.set(true);
  }

  executeDelete(): void {
    if (!this.deletingMed) return;
    this.medService.deleteMedication(this.deletingMed.id);
    this.toastService.info('Medication Removed', 'Medication deleted.');
    this.isDeleteOpen.set(false);
    this.deletingMed = undefined;
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
