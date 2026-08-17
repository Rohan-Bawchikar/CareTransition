import { Component, Input, Output, EventEmitter, OnInit, OnChanges, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Patient, Gender, PatientStatus } from '../../../core/models/patient.model';
import { getLocalISODate } from '../../../core/utils/date-utils';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)" role="presentation">
        <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="patient-form-title" aria-describedby="patient-form-desc">
          <div class="modal-header">
            <div class="header-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="19" y1="8" x2="19" y2="14"></line>
                <line x1="22" y1="11" x2="16" y2="11"></line>
              </svg>
            </div>
            <div>
              <h3 id="patient-form-title" class="modal-title">{{ isEdit ? 'Edit Patient Record' : 'Register New Patient' }}</h3>
              <p id="patient-form-desc" class="modal-subtitle">Enter post-discharge clinical profile details</p>
            </div>
            <button type="button" class="close-btn" (click)="cancel.emit()" aria-label="Close dialog">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <form [formGroup]="patientForm" (ngSubmit)="onSubmit()" class="form-body">
            <!-- Row 1: Full Name & Age -->
            <div class="form-grid-2">
              <div class="form-group">
                <label for="fullName" class="form-label">Full Name <span class="req">*</span></label>
                <input 
                  id="fullName" 
                  type="text" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid('fullName')"
                  formControlName="fullName" 
                  placeholder="e.g. Ramesh Kulkarni, Sunita Sharma" 
                />
                @if (isFieldInvalid('fullName')) {
                  <span class="error-msg">Patient full name is required (min 2 characters).</span>
                }
              </div>

              <div class="form-group">
                <label for="age" class="form-label">Age <span class="req">*</span></label>
                <input 
                  id="age" 
                  type="number" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid('age')"
                  formControlName="age" 
                  placeholder="e.g. 62" 
                />
                @if (isFieldInvalid('age')) {
                  <span class="error-msg">Please enter a valid age (1 - 120).</span>
                }
              </div>
            </div>

            <!-- Row 2: Gender & Contact Number -->
            <div class="form-grid-2">
              <div class="form-group">
                <label for="gender" class="form-label">Gender <span class="req">*</span></label>
                <select id="gender" class="form-control" formControlName="gender">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label for="contactNumber" class="form-label">Contact Number <span class="req">*</span></label>
                <input 
                  id="contactNumber" 
                  type="text" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid('contactNumber')"
                  formControlName="contactNumber" 
                  placeholder="+91 98765 43210" 
                />
                @if (isFieldInvalid('contactNumber')) {
                  <span class="error-msg">Valid contact number required (min 7 digits).</span>
                }
              </div>
            </div>

            <!-- Row 3: Primary Condition & Department -->
            <div class="form-grid-2">
              <div class="form-group">
                <label for="primaryCondition" class="form-label">Primary Diagnosis / Condition <span class="req">*</span></label>
                <input 
                  id="primaryCondition" 
                  type="text" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid('primaryCondition')"
                  formControlName="primaryCondition" 
                  placeholder="e.g. Total Knee Replacement (TKR), Post-CABG" 
                />
                @if (isFieldInvalid('primaryCondition')) {
                  <span class="error-msg">Primary diagnosis is required.</span>
                }
              </div>

              <div class="form-group">
                <label for="department" class="form-label">Hospital Department <span class="req">*</span></label>
                <select id="department" class="form-control" formControlName="department">
                  <option value="Cardiology">Cardiology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Pulmonology">Pulmonology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Endocrinology">Endocrinology</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                </select>
              </div>
            </div>

            <!-- Row 4: Assigned Doctor & Discharge Date -->
            <div class="form-grid-2">
              <div class="form-group">
                <label for="assignedDoctor" class="form-label">Assigned Attending Doctor <span class="req">*</span></label>
                <input 
                  id="assignedDoctor" 
                  type="text" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid('assignedDoctor')"
                  formControlName="assignedDoctor" 
                  placeholder="e.g. Dr. Arvind Swaminathan" 
                />
                @if (isFieldInvalid('assignedDoctor')) {
                  <span class="error-msg">Doctor name is required.</span>
                }
              </div>

              <div class="form-group">
                <label for="dischargeDate" class="form-label">Discharge Date <span class="req">*</span></label>
                <input 
                  id="dischargeDate" 
                  type="date" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid('dischargeDate')"
                  formControlName="dischargeDate" 
                />
                @if (isFieldInvalid('dischargeDate')) {
                  <span class="error-msg">Discharge date is required.</span>
                }
              </div>
            </div>

            <!-- Row 5: Emergency Contact & Status -->
            <div class="form-grid-2">
              <div class="form-group">
                <label for="emergencyContact" class="form-label">Emergency Caregiver Contact</label>
                <input 
                  id="emergencyContact" 
                  type="text" 
                  class="form-control" 
                  formControlName="emergencyContact" 
                  placeholder="e.g. +91 98230 99887 (Son - Amit)" 
                />
              </div>

              <div class="form-group">
                <label for="status" class="form-label">Care Status</label>
                <select id="status" class="form-control" formControlName="status">
                  <option value="active">Active (Under Post-Discharge Monitoring)</option>
                  <option value="attention_needed">Attention Needed (High/Medium Risk)</option>
                  <option value="completed">Completed (Discharge Goals Met)</option>
                </select>
              </div>
            </div>

            <!-- Row 6: Clinical Notes -->
            <div class="form-group">
              <label for="notes" class="form-label">Post-Discharge Care Notes</label>
              <textarea 
                id="notes" 
                rows="2" 
                class="form-control textarea" 
                formControlName="notes" 
                placeholder="Specific precautions, mobility targets, or follow-up instructions..."
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="cancel.emit()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="patientForm.invalid">
                {{ isEdit ? 'Save Changes' : 'Register Patient' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1100;
      padding: 16px;
      animation: fadeIn 0.15s ease-out;
    }

    .modal-container {
      background: #ffffff;
      border-radius: 16px;
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
      position: relative;
    }

    .header-icon {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: #f0fdfa;
      color: #0d9488;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .modal-subtitle {
      font-size: 0.8rem;
      color: #64748b;
      margin: 2px 0 0;
    }

    .close-btn {
      position: absolute;
      right: 20px;
      top: 20px;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
    }
    .close-btn:hover {
      color: #334155;
      background: #f1f5f9;
    }

    .form-body {
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #334155;
    }

    .req {
      color: #e11d48;
    }

    .form-control {
      padding: 9px 12px;
      font-size: 0.88rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      color: #1e293b;
      background-color: #ffffff;
      outline: none;
      transition: all 0.15s ease;
    }

    .form-control:focus {
      border-color: #0d9488;
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
    }

    .form-control.is-invalid {
      border-color: #e11d48;
      background-color: #fff1f2;
    }

    .textarea {
      resize: vertical;
      font-family: inherit;
    }

    .error-msg {
      font-size: 0.75rem;
      color: #e11d48;
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
      border-color: #cbd5e1;
    }
    .btn-secondary:hover {
      background: #e2e8f0;
    }

    .btn-primary {
      background: #0d9488;
      color: #ffffff;
    }
    .btn-primary:hover:not(:disabled) {
      background: #0f766e;
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 640px) {
      .form-grid-2 {
        grid-template-columns: 1fr;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(16px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class PatientFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() isOpen = false;
  @Input() patientToEdit?: Patient;

  @Output() save = new EventEmitter<Omit<Patient, 'id'> | Patient>();
  @Output() cancel = new EventEmitter<void>();

  patientForm!: FormGroup;

  get isEdit(): boolean {
    return !!this.patientToEdit;
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(): void {
    this.initForm();
  }

  private initForm(): void {
    const p = this.patientToEdit;
    const todayStr = getLocalISODate();

    this.patientForm = this.fb.group({
      fullName: [p ? p.fullName : '', [Validators.required, Validators.minLength(2)]],
      age: [p ? p.age : '', [Validators.required, Validators.min(1), Validators.max(120)]],
      gender: [p ? p.gender : 'Female', Validators.required],
      contactNumber: [p ? p.contactNumber : '', [Validators.required, Validators.minLength(7)]],
      emergencyContact: [p ? (p.emergencyContact || '') : ''],
      primaryCondition: [p ? p.primaryCondition : '', Validators.required],
      department: [p ? (p.department || 'Orthopedics') : 'Orthopedics', Validators.required],
      assignedDoctor: [p ? p.assignedDoctor : '', Validators.required],
      dischargeDate: [p ? p.dischargeDate : todayStr, Validators.required],
      status: [p ? p.status : 'active', Validators.required],
      notes: [p ? (p.notes || '') : '']
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const ctrl = this.patientForm.get(fieldName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    const formVal = this.patientForm.value;
    if (this.isEdit && this.patientToEdit) {
      this.save.emit({
        ...this.patientToEdit,
        ...formVal,
        age: Number(formVal.age)
      });
    } else {
      this.save.emit({
        ...formVal,
        age: Number(formVal.age)
      });
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.cancel.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isOpen) {
      this.cancel.emit();
    }
  }
}
