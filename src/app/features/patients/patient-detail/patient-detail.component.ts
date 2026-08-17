import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { MedicationService } from '../../../core/services/medication.service';
import { FollowUpService } from '../../../core/services/follow-up.service';
import { RecoveryTaskService } from '../../../core/services/recovery-task.service';
import { DischargePlanService } from '../../../core/services/discharge-plan.service';
import { RiskAssessmentService } from '../../../core/services/risk-assessment.service';
import { ToastService } from '../../../core/services/toast.service';
import { Patient, PatientStatus } from '../../../core/models/patient.model';
import { Medication } from '../../../core/models/medication.model';
import { FollowUp, FollowUpStatus } from '../../../core/models/follow-up.model';
import { RecoveryTask, TaskCategory } from '../../../core/models/recovery-task.model';
import { DischargePlan } from '../../../core/models/discharge-plan.model';
import { RiskSummary } from '../../../core/models/risk-summary.model';
import { RiskBadgeComponent } from '../../../shared/components/risk-badge/risk-badge.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ProgressCardComponent } from '../../../shared/components/progress-card/progress-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { JourneyStepperComponent, JourneyStep } from '../../../shared/components/journey-stepper/journey-stepper.component';
import { PatientFormComponent } from '../patient-form/patient-form.component';
import { getLocalISODate, getLocalISODateTime, parseLocalDate, formatReadableDateTime } from '../../../core/utils/date-utils';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    RiskBadgeComponent,
    StatusBadgeComponent,
    ProgressCardComponent,
    EmptyStateComponent,
    ConfirmationDialogComponent,
    JourneyStepperComponent,
    PatientFormComponent
  ],
  template: `
    @if (!patient()) {
      <div class="page-container">
        <app-empty-state
          title="Patient Not Found"
          description="The requested patient record could not be found or has been removed."
          icon="patient"
          actionLabel="Return to Patient Directory"
          (action)="router.navigate(['/patients'])"
        ></app-empty-state>
      </div>
    } @else {
      <div class="page-container">
        <!-- Back Navigation & Quick Actions -->
        <div class="top-nav-bar">
          <a routerLink="/patients" class="back-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Patients
          </a>

          <div class="header-actions">
            <button type="button" class="btn btn-outline" (click)="isEditPatientOpen.set(true)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit Profile
            </button>
            <button type="button" class="btn btn-danger-outline" (click)="isDeletePatientOpen.set(true)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Delete
            </button>
          </div>
        </div>

        <!-- Patient Header Hero Card -->
        <div class="patient-hero-card" [class.hero-high-risk]="riskSummary().level === 'HIGH'">
          <div class="hero-main-info">
            <div class="hero-avatar">
              {{ getInitials(patient()!.fullName) }}
            </div>
            <div class="hero-details">
              <div class="name-status-row">
                <h1 class="hero-name">{{ patient()!.fullName }}</h1>
                <app-status-badge [status]="patient()!.status"></app-status-badge>
              </div>
              <div class="hero-subtext">
                <span>{{ patient()!.age }} years old</span> • 
                <span>{{ patient()!.gender }}</span> • 
                <span>Primary Diagnosis: <strong>{{ patient()!.primaryCondition }}</strong></span>
              </div>
              <div class="hero-contact-row">
                <span class="contact-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  {{ patient()!.contactNumber }}
                </span>
                @if (patient()!.emergencyContact) {
                  <span class="contact-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                    Emergency: {{ patient()!.emergencyContact }}
                  </span>
                }
                <span class="contact-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Discharged: {{ patient()!.dischargeDate }}
                </span>
                <span class="contact-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Doctor: {{ patient()!.assignedDoctor }} ({{ patient()!.department || 'General' }})
                </span>
              </div>
            </div>
          </div>

          <!-- Risk Assessment Overview Box -->
          <div class="hero-risk-panel" [ngClass]="'risk-panel-' + riskSummary().level.toLowerCase()">
            <div class="risk-panel-header">
              <span class="risk-panel-label">RULE-BASED RISK INDICATOR</span>
              <app-risk-badge [level]="riskSummary().level" size="md"></app-risk-badge>
            </div>
            <div class="risk-panel-reason">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{{ riskSummary().reason }}</span>
            </div>
            <div class="risk-factors-list">
              @for (factor of riskSummary().factors; track factor) {
                <div class="factor-item">• {{ factor }}</div>
              }
            </div>
            <div class="risk-metrics-row">
              <div class="mini-stat">
                <span class="stat-num" [class.danger]="riskSummary().overdueFollowUps > 0">{{ riskSummary().overdueFollowUps }}</span>
                <span class="stat-lbl">Overdue Follow-Ups</span>
              </div>
              <div class="mini-stat">
                <span class="stat-num" [class.danger]="riskSummary().overdueTasks > 0">{{ riskSummary().overdueTasks }}</span>
                <span class="stat-lbl">Overdue Tasks</span>
              </div>
              <div class="mini-stat">
                <span class="stat-num">{{ riskSummary().completionPercentage }}%</span>
                <span class="stat-lbl">Recovery Adherence</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Visual 5-Step Patient Recovery Stepper -->
        <div class="section-block">
          <div class="block-header">
            <h3 class="block-title">Patient Transition Journey</h3>
            <span class="block-tag">Continuous Post-Acute Pathway</span>
          </div>
          <app-journey-stepper [steps]="journeySteps()"></app-journey-stepper>
        </div>

        <!-- Main Content Tabs -->
        <div class="tabs-nav-wrapper">
          <div class="tabs-nav">
            <button 
              type="button" 
              class="tab-btn" 
              [class.active]="activeTab === 'plan'"
              (click)="activeTab = 'plan'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              Discharge Plan & Notes
            </button>

            <button 
              type="button" 
              class="tab-btn" 
              [class.active]="activeTab === 'medications'"
              (click)="activeTab = 'medications'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
                <path d="m8.5 8.5 7 7"></path>
              </svg>
              Medications
              <span class="tab-badge">{{ patientMedications().length }}</span>
            </button>

            <button 
              type="button" 
              class="tab-btn" 
              [class.active]="activeTab === 'followups'"
              (click)="activeTab = 'followups'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Follow-Up Appointments
              <span class="tab-badge" [class.tab-badge-danger]="riskSummary().overdueFollowUps > 0">
                {{ patientFollowUps().length }}
              </span>
            </button>

            <button 
              type="button" 
              class="tab-btn" 
              [class.active]="activeTab === 'tasks'"
              (click)="activeTab = 'tasks'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              Recovery Tasks & Progress
              <span class="tab-badge">{{ patientTasks().length }}</span>
            </button>
          </div>
        </div>

        <!-- Tab 1: Discharge Plan & Clinical Instructions -->
        @if (activeTab === 'plan') {
          <div class="tab-content">
            <div class="tab-toolbar">
              <div>
                <h3 class="tab-heading">Discharge Protocol & Care Guidelines</h3>
                <p class="tab-subheading">Personalized post-acute recovery instructions, activity limits, and red flag warnings</p>
              </div>
              <button type="button" class="btn btn-outline" (click)="openEditPlanModal()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Discharge Plan
              </button>
            </div>

            <div class="plan-grid">
              <div class="plan-card">
                <h4 class="card-section-title">Clinical Discharge Summary</h4>
                <p class="summary-text">{{ dischargePlan()?.summary || patient()!.notes || 'Patient discharged with stable vital signs and clear instructions.' }}</p>
                
                <h4 class="card-section-title">Care & Wound Instructions</h4>
                <p class="summary-text">{{ dischargePlan()?.careInstructions || 'Follow all prescribed medication schedules and maintain recommended hygiene routines.' }}</p>

                <div class="restrictions-row">
                  <div class="restriction-box">
                    <span class="box-lbl">Dietary Protocol</span>
                    <span class="box-val">{{ dischargePlan()?.dietaryRestrictions || 'Standard balanced nutrition with adequate hydration.' }}</span>
                  </div>
                  <div class="restriction-box">
                    <span class="box-lbl">Activity & Mobility</span>
                    <span class="box-val">{{ dischargePlan()?.activityRestrictions || 'Light walking as tolerated; avoid strenuous lifting.' }}</span>
                  </div>
                </div>
              </div>

              <div class="plan-card sidebar-plan-card">
                <h4 class="card-section-title red-flags-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  Red Flag Warning Symptoms
                </h4>
                <p class="red-flags-subtitle">Contact the hospital or emergency line immediately if experiencing:</p>
                <ul class="red-flags-list">
                  @for (flag of (dischargePlan()?.redFlags || defaultRedFlags); track flag) {
                    <li>{{ flag }}</li>
                  }
                </ul>

                <div class="caregiver-box">
                  <span class="cg-lbl">Assigned Primary Caregiver</span>
                  <span class="cg-name">{{ dischargePlan()?.caregiverName || patient()!.emergencyContact || 'Family Member / Self' }}</span>
                  @if (dischargePlan()?.caregiverPhone) {
                    <span class="cg-phone">{{ dischargePlan()?.caregiverPhone }}</span>
                  }
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Tab 2: Medications -->
        @if (activeTab === 'medications') {
          <div class="tab-content">
            <div class="tab-toolbar">
              <div>
                <h3 class="tab-heading">Prescribed Discharge Medications</h3>
                <p class="tab-subheading">Track adherence and active duration for post-discharge drugs</p>
              </div>
              <button type="button" class="btn btn-primary" (click)="openAddMedicationModal()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Medication
              </button>
            </div>

            @if (patientMedications().length === 0) {
              <app-empty-state
                title="No medications registered"
                description="No medications have been added to this patient's post-discharge protocol."
                icon="medication"
                actionLabel="Add Medication"
                (action)="openAddMedicationModal()"
              ></app-empty-state>
            } @else {
              <div class="medications-grid">
                @for (med of patientMedications(); track med.id) {
                  <div class="med-card" [class.med-completed]="med.status === 'completed'">
                    <div class="med-header">
                      <div class="med-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
                          <path d="m8.5 8.5 7 7"></path>
                        </svg>
                      </div>
                      <div class="med-name-wrap">
                        <h4 class="med-name">{{ med.name }}</h4>
                        <span class="med-dosage">{{ med.dosage }}</span>
                      </div>
                      <app-status-badge [status]="med.status" size="sm"></app-status-badge>
                    </div>

                    <div class="med-details">
                      <div class="med-meta-row">
                        <span class="med-meta-lbl">Frequency:</span>
                        <span class="med-meta-val">{{ med.frequency }}</span>
                      </div>
                      <div class="med-meta-row">
                        <span class="med-meta-lbl">Schedule:</span>
                        <span class="med-meta-val">{{ med.startDate }} → {{ med.endDate }}</span>
                      </div>
                      @if (med.instructions) {
                        <div class="med-instructions">
                          {{ med.instructions }}
                        </div>
                      }
                    </div>

                    <div class="med-card-footer">
                      <button 
                        type="button" 
                        class="btn-text-action" 
                        (click)="toggleMedStatus(med.id)"
                      >
                        {{ med.status === 'active' ? 'Mark Completed' : 'Reactivate' }}
                      </button>

                      <div class="med-actions-group">
                        <button type="button" class="btn-icon" (click)="openEditMedicationModal(med)" title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button type="button" class="btn-icon btn-icon-danger" (click)="confirmDeleteMed(med)" title="Delete">
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
        }

        <!-- Tab 3: Follow-Up Appointments -->
        @if (activeTab === 'followups') {
          <div class="tab-content">
            <div class="tab-toolbar">
              <div>
                <h3 class="tab-heading">Scheduled Clinical Follow-Ups</h3>
                <p class="tab-subheading">Timely attendance prevents readmission and post-discharge complications</p>
              </div>
              <button type="button" class="btn btn-primary" (click)="openAddFollowUpModal()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Schedule Follow-Up
              </button>
            </div>

            @if (patientFollowUps().length === 0) {
              <app-empty-state
                title="No follow-up appointments scheduled"
                description="Schedule clinic check-ups, surgeon evaluations, or rehabilitation milestones."
                icon="calendar"
                actionLabel="Schedule Follow-Up"
                (action)="openAddFollowUpModal()"
              ></app-empty-state>
            } @else {
              <div class="followups-timeline">
                @for (followUp of patientFollowUps(); track followUp.id) {
                  <div class="timeline-item" [class.timeline-overdue]="followUp.status === 'overdue'" [class.timeline-done]="followUp.status === 'completed'">
                    <div class="timeline-marker">
                      @if (followUp.status === 'completed') {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      } @else if (followUp.status === 'overdue') {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                      } @else {
                        <span class="dot"></span>
                      }
                    </div>

                    <div class="timeline-card">
                      <div class="timeline-card-header">
                        <div>
                          <h4 class="appt-title">{{ followUp.title }}</h4>
                          <span class="appt-dept">{{ followUp.department }} • With {{ followUp.doctorName }}</span>
                        </div>
                        <app-status-badge [status]="followUp.status"></app-status-badge>
                      </div>

                      @if (followUp.status === 'overdue') {
                        <div class="overdue-banner">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                          <span>This follow-up was scheduled for {{ formatApptDate(followUp.appointmentDate) }} and is OVERDUE. Please contact the patient to reschedule or record attendance.</span>
                        </div>
                      }

                      <div class="appt-meta-grid">
                        <div class="appt-meta-item">
                          <span class="meta-lbl">Date & Time:</span>
                          <span class="meta-val">{{ formatApptDate(followUp.appointmentDate) }}</span>
                        </div>
                        @if (followUp.location) {
                          <div class="appt-meta-item">
                            <span class="meta-lbl">Location / Room:</span>
                            <span class="meta-val">{{ followUp.location }}</span>
                          </div>
                        }
                      </div>

                      @if (followUp.notes) {
                        <p class="appt-notes">{{ followUp.notes }}</p>
                      }

                      <div class="timeline-card-actions">
                        @if (followUp.status !== 'completed') {
                          <button 
                            type="button" 
                            class="btn btn-sm btn-success" 
                            (click)="markFollowUpDone(followUp.id)"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Mark as Attended / Completed
                          </button>
                        }

                        <div class="action-btn-group">
                          <button type="button" class="btn-icon" (click)="openEditFollowUpModal(followUp)" title="Edit / Reschedule">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button type="button" class="btn-icon btn-icon-danger" (click)="confirmDeleteFollowUp(followUp)" title="Delete">
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
        }

        <!-- Tab 4: Recovery Tasks & Checklist -->
        @if (activeTab === 'tasks') {
          <div class="tab-content">
            <div class="tab-toolbar">
              <div>
                <h3 class="tab-heading">Recovery Tasks & Activity Adherence</h3>
                <p class="tab-subheading">Mark activities to automatically recalculate recovery progress and patient risk</p>
              </div>
              <button type="button" class="btn btn-primary" (click)="openAddTaskModal()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Recovery Task
              </button>
            </div>

            <!-- Progress Bar Card -->
            <div class="progress-bar-card-wrapper">
              <app-progress-card
                title="Overall Patient Recovery Completion"
                [percentage]="riskSummary().completionPercentage"
                [subtitle]="(patientTasks().length - riskSummary().incompleteTasks) + ' of ' + patientTasks().length + ' activities completed'"
                [details]="riskSummary().incompleteTasks + ' remaining tasks'"
              ></app-progress-card>
            </div>

            @if (patientTasks().length === 0) {
              <app-empty-state
                title="No recovery tasks assigned"
                description="Assign daily exercises, vitals monitoring, wound care steps, or dietary goals."
                icon="task"
                actionLabel="Add Recovery Task"
                (action)="openAddTaskModal()"
              ></app-empty-state>
            } @else {
              <div class="tasks-checklist">
                @for (task of patientTasks(); track task.id) {
                  <div class="task-checklist-item" [class.task-completed]="task.completed" [class.task-overdue]="isTaskOverdue(task)">
                    <div class="task-checkbox-wrap">
                      <input 
                        type="checkbox" 
                        [id]="'chk-' + task.id" 
                        class="task-checkbox" 
                        [checked]="task.completed"
                        (change)="toggleTask(task.id)"
                      />
                    </div>

                    <div class="task-info">
                      <div class="task-title-row">
                        <label [for]="'chk-' + task.id" class="task-title">{{ task.title }}</label>
                        <span class="category-pill">{{ task.category }}</span>
                      </div>
                      <p class="task-desc">{{ task.description }}</p>
                      <div class="task-meta">
                        <span>Due Date: <strong>{{ task.dueDate }}</strong></span>
                        @if (isTaskOverdue(task)) {
                          <span class="badge-overdue-task">Past Due</span>
                        }
                        @if (task.completed && task.completedDate) {
                          <span class="badge-completed-task">Completed on {{ task.completedDate }}</span>
                        }
                      </div>
                    </div>

                    <div class="task-actions">
                      <button type="button" class="btn-icon" (click)="openEditTaskModal(task)" title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button type="button" class="btn-icon btn-icon-danger" (click)="confirmDeleteTask(task)" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- Modals -->

      <!-- 1. Patient Form Modal -->
      <app-patient-form
        [isOpen]="isEditPatientOpen()"
        [patientToEdit]="patient()"
        (save)="handleUpdatePatient($event)"
        (cancel)="isEditPatientOpen.set(false)"
      ></app-patient-form>

      <!-- 2. Delete Patient Modal -->
      <app-confirmation-dialog
        [isOpen]="isDeletePatientOpen()"
        title="Delete Patient Record?"
        [message]="'Are you sure you want to delete ' + patient()!.fullName + ' and all associated post-discharge records?'"
        confirmText="Delete Patient"
        cancelText="Cancel"
        [isDestructive]="true"
        (confirm)="executeDeletePatient()"
        (cancel)="isDeletePatientOpen.set(false)"
      ></app-confirmation-dialog>

      <!-- 3. Medication Modal -->
      @if (isMedModalOpen()) {
        <div class="modal-backdrop" (click)="onBackdropCloseMed($event)" role="presentation">
          <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="med-modal-title">
            <h3 id="med-modal-title" class="modal-title">{{ editingMed ? 'Edit Medication' : 'Add Medication' }}</h3>
            <form [formGroup]="medForm" (ngSubmit)="saveMedication()" class="modal-form">
              <div class="form-group">
                <label for="medName" class="form-label">Medication Name & Formulation *</label>
                <input 
                  id="medName"
                  type="text" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid(medForm, 'name')"
                  formControlName="name" 
                  placeholder="e.g. Enoxaparin (Lovenox), Metoprolol" 
                />
                @if (isFieldInvalid(medForm, 'name')) {
                  <span class="error-msg">Medication name is required.</span>
                }
              </div>
              <div class="form-grid-2">
                <div class="form-group">
                  <label for="medDosage" class="form-label">Dosage *</label>
                  <input 
                    id="medDosage"
                    type="text" 
                    class="form-control" 
                    [class.is-invalid]="isFieldInvalid(medForm, 'dosage')"
                    formControlName="dosage" 
                    placeholder="e.g. 40 mg, 500 mg" 
                  />
                  @if (isFieldInvalid(medForm, 'dosage')) {
                    <span class="error-msg">Dosage is required.</span>
                  }
                </div>
                <div class="form-group">
                  <label for="medFrequency" class="form-label">Frequency *</label>
                  <input 
                    id="medFrequency"
                    type="text" 
                    class="form-control" 
                    [class.is-invalid]="isFieldInvalid(medForm, 'frequency')"
                    formControlName="frequency" 
                    placeholder="e.g. Twice daily with meals" 
                  />
                  @if (isFieldInvalid(medForm, 'frequency')) {
                    <span class="error-msg">Frequency is required.</span>
                  }
                </div>
              </div>
              <div class="form-grid-2">
                <div class="form-group">
                  <label for="medStartDate" class="form-label">Start Date *</label>
                  <input 
                    id="medStartDate"
                    type="date" 
                    class="form-control" 
                    [class.is-invalid]="isFieldInvalid(medForm, 'startDate')"
                    formControlName="startDate" 
                  />
                  @if (isFieldInvalid(medForm, 'startDate')) {
                    <span class="error-msg">Start date is required.</span>
                  }
                </div>
                <div class="form-group">
                  <label for="medEndDate" class="form-label">End Date *</label>
                  <input 
                    id="medEndDate"
                    type="date" 
                    class="form-control" 
                    [class.is-invalid]="isFieldInvalid(medForm, 'endDate')"
                    formControlName="endDate" 
                  />
                  @if (isFieldInvalid(medForm, 'endDate')) {
                    <span class="error-msg">End date is required.</span>
                  }
                </div>
              </div>
              <div class="form-group">
                <label for="medStatus" class="form-label">Status</label>
                <select id="medStatus" class="form-control" formControlName="status">
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
              <div class="form-group">
                <label for="medInstructions" class="form-label">Administration Instructions</label>
                <textarea id="medInstructions" rows="2" class="form-control" formControlName="instructions" placeholder="e.g. Take with full glass of water. Do not crush."></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="isMedModalOpen.set(false)">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="medForm.invalid">Save Medication</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- 4. Follow-Up Modal -->
      @if (isFollowUpModalOpen()) {
        <div class="modal-backdrop" (click)="onBackdropCloseFollowUp($event)" role="presentation">
          <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="followup-modal-title">
            <h3 id="followup-modal-title" class="modal-title">{{ editingFollowUp ? 'Edit Follow-Up Appointment' : 'Schedule Clinical Follow-Up' }}</h3>
            <form [formGroup]="followUpForm" (ngSubmit)="saveFollowUp()" class="modal-form">
              <div class="form-group">
                <label for="flwTitle" class="form-label">Appointment Title *</label>
                <input 
                  id="flwTitle"
                  type="text" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid(followUpForm, 'title')"
                  formControlName="title" 
                  placeholder="e.g. 1-Week Surgical Wound Check & Suture Review" 
                />
                @if (isFieldInvalid(followUpForm, 'title')) {
                  <span class="error-msg">Appointment title is required.</span>
                }
              </div>
              <div class="form-grid-2">
                <div class="form-group">
                  <label for="flwDate" class="form-label">Appointment Date & Time *</label>
                  <input 
                    id="flwDate"
                    type="datetime-local" 
                    class="form-control" 
                    [class.is-invalid]="isFieldInvalid(followUpForm, 'appointmentDate')"
                    formControlName="appointmentDate" 
                  />
                  @if (isFieldInvalid(followUpForm, 'appointmentDate')) {
                    <span class="error-msg">Date & time is required.</span>
                  }
                </div>
                <div class="form-group">
                  <label for="flwDept" class="form-label">Department *</label>
                  <input 
                    id="flwDept"
                    type="text" 
                    class="form-control" 
                    [class.is-invalid]="isFieldInvalid(followUpForm, 'department')"
                    formControlName="department" 
                    placeholder="e.g. Orthopedic Surgery, Cardiology" 
                  />
                  @if (isFieldInvalid(followUpForm, 'department')) {
                    <span class="error-msg">Department is required.</span>
                  }
                </div>
              </div>
              <div class="form-grid-2">
                <div class="form-group">
                  <label for="flwDoctor" class="form-label">Physician / Clinician *</label>
                  <input 
                    id="flwDoctor"
                    type="text" 
                    class="form-control" 
                    [class.is-invalid]="isFieldInvalid(followUpForm, 'doctorName')"
                    formControlName="doctorName" 
                    placeholder="e.g. Dr. Arthur Sterling" 
                  />
                  @if (isFieldInvalid(followUpForm, 'doctorName')) {
                    <span class="error-msg">Doctor name is required.</span>
                  }
                </div>
                <div class="form-group">
                  <label for="flwLocation" class="form-label">Location / Clinic Room</label>
                  <input id="flwLocation" type="text" class="form-control" formControlName="location" placeholder="e.g. West Wing Suite 402" />
                </div>
              </div>
              <div class="form-group">
                <label for="flwStatus" class="form-label">Status</label>
                <select id="flwStatus" class="form-control" formControlName="status">
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div class="form-group">
                <label for="flwNotes" class="form-label">Clinical Notes / Preparation Instructions</label>
                <textarea id="flwNotes" rows="2" class="form-control" formControlName="notes" placeholder="Bring recent X-rays, fast for 8 hours if blood work needed..."></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="isFollowUpModalOpen.set(false)">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="followUpForm.invalid">Save Appointment</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- 5. Recovery Task Modal -->
      @if (isTaskModalOpen()) {
        <div class="modal-backdrop" (click)="onBackdropCloseTask($event)" role="presentation">
          <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
            <h3 id="task-modal-title" class="modal-title">{{ editingTask ? 'Edit Recovery Task' : 'Assign Recovery Task' }}</h3>
            <form [formGroup]="taskForm" (ngSubmit)="saveTask()" class="modal-form">
              <div class="form-group">
                <label for="tskTitle" class="form-label">Task Title *</label>
                <input 
                  id="tskTitle"
                  type="text" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid(taskForm, 'title')"
                  formControlName="title" 
                  placeholder="e.g. Complete 30 min quad exercises, Log blood pressure" 
                />
                @if (isFieldInvalid(taskForm, 'title')) {
                  <span class="error-msg">Task title is required.</span>
                }
              </div>
              <div class="form-grid-2">
                <div class="form-group">
                  <label for="tskCategory" class="form-label">Category *</label>
                  <select id="tskCategory" class="form-control" formControlName="category">
                    <option value="Physical Therapy">Physical Therapy</option>
                    <option value="Vitals">Vitals Monitoring</option>
                    <option value="Wound Care">Wound Care</option>
                    <option value="Diet">Diet & Nutrition</option>
                    <option value="Medication">Medication Adherence</option>
                    <option value="General">General Care</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="tskDueDate" class="form-label">Due Date *</label>
                  <input 
                    id="tskDueDate"
                    type="date" 
                    class="form-control" 
                    [class.is-invalid]="isFieldInvalid(taskForm, 'dueDate')"
                    formControlName="dueDate" 
                  />
                  @if (isFieldInvalid(taskForm, 'dueDate')) {
                    <span class="error-msg">Due date is required.</span>
                  }
                </div>
              </div>
              <div class="form-group">
                <label for="tskDesc" class="form-label">Task Description & Instructions</label>
                <textarea id="tskDesc" rows="2" class="form-control" formControlName="description" placeholder="Instructions, target metrics, or precaution guidelines..."></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="isTaskModalOpen.set(false)">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="taskForm.invalid">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- 6. Discharge Plan Edit Modal -->
      @if (isPlanModalOpen()) {
        <div class="modal-backdrop" (click)="onBackdropClosePlan($event)" role="presentation">
          <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="plan-modal-title">
            <h3 id="plan-modal-title" class="modal-title">Edit Discharge Protocol</h3>
            <form [formGroup]="planForm" (ngSubmit)="saveDischargePlan()" class="modal-form">
              <div class="form-group">
                <label for="planSummary" class="form-label">Clinical Discharge Summary *</label>
                <textarea 
                  id="planSummary"
                  rows="2" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid(planForm, 'summary')"
                  formControlName="summary" 
                  placeholder="Primary clinical outcome and transition goals..."
                ></textarea>
                @if (isFieldInvalid(planForm, 'summary')) {
                  <span class="error-msg">Summary is required.</span>
                }
              </div>

              <div class="form-group">
                <label for="planCare" class="form-label">Care & Wound Instructions *</label>
                <textarea 
                  id="planCare"
                  rows="2" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid(planForm, 'careInstructions')"
                  formControlName="careInstructions" 
                  placeholder="Hygiene, dressing changes, and wound care..."
                ></textarea>
                @if (isFieldInvalid(planForm, 'careInstructions')) {
                  <span class="error-msg">Care instructions are required.</span>
                }
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label for="planDiet" class="form-label">Dietary Protocol</label>
                  <input id="planDiet" type="text" class="form-control" formControlName="dietaryRestrictions" placeholder="e.g. Low sodium, high fiber, 2L water" />
                </div>
                <div class="form-group">
                  <label for="planActivity" class="form-label">Activity & Mobility Limits</label>
                  <input id="planActivity" type="text" class="form-control" formControlName="activityRestrictions" placeholder="e.g. No lifting > 5kg, light walks" />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label for="planCaregiver" class="form-label">Primary Caregiver Name</label>
                  <input id="planCaregiver" type="text" class="form-control" formControlName="caregiverName" placeholder="e.g. Suresh Sharma" />
                </div>
                <div class="form-group">
                  <label for="planCaregiverPhone" class="form-label">Caregiver Phone</label>
                  <input id="planCaregiverPhone" type="text" class="form-control" formControlName="caregiverPhone" placeholder="e.g. +91 98112 88776" />
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="isPlanModalOpen.set(false)">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="planForm.invalid">Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- 6. Delete Action Confirmation Dialog -->
      <app-confirmation-dialog
        [isOpen]="isDeleteConfirmOpen()"
        [title]="deleteConfirmTitle"
        [message]="deleteConfirmMessage"
        confirmText="Delete"
        cancelText="Cancel"
        [isDestructive]="true"
        (confirm)="executeConfirmedDelete()"
        (cancel)="isDeleteConfirmOpen.set(false)"
      ></app-confirmation-dialog>
    }
  `,
  styles: [`
    .page-container {
      padding: 24px 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .top-nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #0f766e;
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
      transition: color 0.15s;
    }
    .back-link:hover {
      color: #0d9488;
      text-decoration: underline;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    /* Patient Hero Card */
    .patient-hero-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 24px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
      margin-bottom: 24px;
    }

    .patient-hero-card.hero-high-risk {
      border-left: 6px solid #e11d48;
    }

    .hero-main-info {
      display: flex;
      gap: 20px;
    }

    .hero-avatar {
      width: 68px;
      height: 68px;
      border-radius: 16px;
      background: #0f766e;
      color: #ffffff;
      font-size: 1.4rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(15, 118, 110, 0.25);
    }

    .hero-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .name-status-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .hero-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .hero-subtext {
      font-size: 0.9rem;
      color: #475569;
    }

    .hero-contact-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 4px;
    }

    .contact-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.78rem;
      color: #475569;
    }

    /* Risk Assessment Box */
    .hero-risk-panel {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .risk-panel-high {
      background: #fff1f2;
      border-color: #fecdd3;
    }
    .risk-panel-medium {
      background: #fffbeb;
      border-color: #fde68a;
    }
    .risk-panel-low {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .risk-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .risk-panel-label {
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.05em;
    }

    .risk-panel-reason {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.4;
    }

    .risk-factors-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.75rem;
      color: #475569;
    }

    .risk-metrics-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      text-align: center;
    }

    .mini-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-num {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
    }
    .stat-num.danger {
      color: #e11d48;
    }

    .stat-lbl {
      font-size: 0.68rem;
      color: #64748b;
      line-height: 1.2;
    }

    /* Section block */
    .section-block {
      margin-bottom: 24px;
    }

    .block-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .block-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .block-tag {
      font-size: 0.72rem;
      font-weight: 600;
      color: #0d9488;
      background: #f0fdfa;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #ccfbf1;
    }

    /* Tabs Navigation */
    .tabs-nav-wrapper {
      margin-bottom: 20px;
      border-bottom: 2px solid #e2e8f0;
    }

    .tabs-nav {
      display: flex;
      gap: 8px;
      overflow-x: auto;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 18px;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      font-size: 0.9rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .tab-btn:hover {
      color: #0f766e;
    }

    .tab-btn.active {
      color: #0f766e;
      border-bottom-color: #0f766e;
    }

    .tab-badge {
      font-size: 0.72rem;
      background: #f1f5f9;
      color: #475569;
      padding: 2px 8px;
      border-radius: 9999px;
      font-weight: 700;
    }
    .tab-badge-danger {
      background: #ffe4e6;
      color: #e11d48;
    }

    /* Tab Content Area */
    .tab-content {
      animation: fadeIn 0.2s ease-out;
    }

    .tab-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .tab-heading {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 2px;
    }

    .tab-subheading {
      font-size: 0.82rem;
      color: #64748b;
      margin: 0;
    }

    /* Plan Tab Grid */
    .plan-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 20px;
    }

    .plan-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }

    .card-section-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 8px;
    }

    .card-section-title:not(:first-child) {
      margin-top: 20px;
    }

    .summary-text {
      font-size: 0.88rem;
      color: #334155;
      line-height: 1.6;
      margin: 0;
    }

    .restrictions-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 18px;
    }

    .restriction-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 12px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .box-lbl {
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }

    .box-val {
      font-size: 0.82rem;
      color: #1e293b;
      line-height: 1.4;
    }

    .sidebar-plan-card {
      background: #fffbfb;
      border-color: #fed7aa;
    }

    .red-flags-title {
      color: #c2410c;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .red-flags-subtitle {
      font-size: 0.8rem;
      color: #7c2d12;
      margin: 0 0 10px;
    }

    .red-flags-list {
      padding-left: 18px;
      margin: 0 0 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 0.82rem;
      color: #9a3412;
      line-height: 1.4;
    }

    .caregiver-box {
      background: #ffffff;
      border: 1px solid #fed7aa;
      padding: 12px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cg-lbl {
      font-size: 0.7rem;
      font-weight: 700;
      color: #9a3412;
      text-transform: uppercase;
    }

    .cg-name {
      font-size: 0.88rem;
      font-weight: 600;
      color: #1e293b;
    }

    .cg-phone {
      font-size: 0.8rem;
      color: #64748b;
    }

    /* Medications Grid */
    .medications-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .med-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.2s ease;
    }

    .med-card.med-completed {
      opacity: 0.75;
      background: #f8fafc;
    }

    .med-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .med-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
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
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .med-dosage {
      font-size: 0.78rem;
      color: #0d9488;
      font-weight: 600;
    }

    .med-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.8rem;
    }

    .med-meta-row {
      display: flex;
      justify-content: space-between;
    }

    .med-meta-lbl {
      color: #64748b;
    }
    .med-meta-val {
      font-weight: 600;
      color: #1e293b;
    }

    .med-instructions {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 8px;
      border-radius: 6px;
      font-size: 0.76rem;
      color: #475569;
      line-height: 1.4;
    }

    .med-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 8px;
      border-top: 1px solid #f1f5f9;
    }

    .btn-text-action {
      background: none;
      border: none;
      font-size: 0.82rem;
      font-weight: 600;
      color: #0f766e;
      cursor: pointer;
      padding: 0;
    }
    .btn-text-action:hover {
      text-decoration: underline;
    }

    .med-actions-group {
      display: flex;
      gap: 6px;
    }

    /* Follow-ups Timeline */
    .followups-timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;
      padding-left: 20px;
    }

    .followups-timeline::before {
      content: '';
      position: absolute;
      left: 7px;
      top: 16px;
      bottom: 16px;
      width: 2px;
      background: #e2e8f0;
    }

    .timeline-item {
      display: flex;
      gap: 16px;
      position: relative;
    }

    .timeline-marker {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #0ea5e9;
      border: 3px solid #ffffff;
      box-shadow: 0 0 0 2px #0ea5e9;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 18px;
      flex-shrink: 0;
      z-index: 2;
    }

    .timeline-overdue .timeline-marker {
      background: #e11d48;
      box-shadow: 0 0 0 2px #e11d48;
      color: #ffffff;
      width: 20px;
      height: 20px;
      margin-left: -2px;
    }

    .timeline-done .timeline-marker {
      background: #10b981;
      box-shadow: 0 0 0 2px #10b981;
      color: #ffffff;
      width: 20px;
      height: 20px;
      margin-left: -2px;
    }

    .timeline-card {
      flex: 1;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }

    .timeline-overdue .timeline-card {
      border-left: 4px solid #e11d48;
      background: #fffbfb;
    }

    .timeline-card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .appt-title {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 2px;
    }

    .appt-dept {
      font-size: 0.8rem;
      color: #64748b;
    }

    .overdue-banner {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background: #fff1f2;
      border: 1px solid #fecdd3;
      color: #be123c;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .appt-meta-grid {
      display: flex;
      gap: 20px;
      font-size: 0.82rem;
      margin-bottom: 8px;
    }

    .meta-lbl {
      color: #64748b;
      margin-right: 4px;
    }
    .meta-val {
      font-weight: 600;
      color: #1e293b;
    }

    .appt-notes {
      font-size: 0.8rem;
      color: #475569;
      background: #f8fafc;
      padding: 8px 12px;
      border-radius: 6px;
      margin: 8px 0 12px;
    }

    .timeline-card-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid #f1f5f9;
    }

    .btn-success {
      background: #10b981;
      color: #ffffff;
    }
    .btn-success:hover {
      background: #059669;
    }

    /* Tasks Checklist */
    .progress-bar-card-wrapper {
      margin-bottom: 20px;
    }

    .tasks-checklist {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .task-checklist-item {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 18px;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      transition: all 0.15s ease;
    }

    .task-checklist-item:hover {
      border-color: #cbd5e1;
    }

    .task-checklist-item.task-completed {
      background: #f8fafc;
      opacity: 0.8;
      .task-title { text-decoration: line-through; color: #64748b; }
    }

    .task-checklist-item.task-overdue {
      border-left: 4px solid #e11d48;
      background: #fffbfb;
    }

    .task-checkbox-wrap {
      margin-top: 2px;
    }

    .task-checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #0d9488;
    }

    .task-info {
      flex: 1;
    }

    .task-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 2px;
    }

    .task-title {
      font-size: 0.92rem;
      font-weight: 600;
      color: #0f172a;
      cursor: pointer;
    }

    .category-pill {
      font-size: 0.7rem;
      font-weight: 600;
      background: #f0fdfa;
      color: #0f766e;
      border: 1px solid #ccfbf1;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .task-desc {
      font-size: 0.8rem;
      color: #64748b;
      margin: 0 0 6px;
      line-height: 1.4;
    }

    .task-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.75rem;
      color: #64748b;
    }

    .badge-overdue-task {
      background: #ffe4e6;
      color: #e11d48;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
    }

    .badge-completed-task {
      background: #dcfce7;
      color: #15803d;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }

    .task-actions {
      display: flex;
      gap: 6px;
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
      animation: fadeIn 0.15s ease-out;
    }

    .modal-card {
      background: #ffffff;
      border-radius: 16px;
      width: 100%;
      max-width: 540px;
      padding: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
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
      gap: 14px;
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
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
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
      padding: 6px 12px;
      font-size: 0.78rem;
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

    .btn-outline {
      background: #ffffff;
      color: #475569;
      border-color: #cbd5e1;
    }
    .btn-outline:hover {
      background: #f8fafc;
      color: #0f172a;
    }

    .btn-danger-outline {
      background: #ffffff;
      color: #e11d48;
      border-color: #fecdd3;
    }
    .btn-danger-outline:hover {
      background: #fff1f2;
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
      transition: all 0.15s;
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

    @media (max-width: 1024px) {
      .patient-hero-card {
        grid-template-columns: 1fr;
      }
      .plan-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .page-container {
        padding: 16px;
      }
      .hero-main-info {
        flex-direction: column;
      }
      .form-grid-2 {
        grid-template-columns: 1fr;
      }
      .appt-meta-grid {
        flex-direction: column;
        gap: 4px;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(12px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class PatientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private fb = inject(FormBuilder);
  private patientService = inject(PatientService);
  private medicationService = inject(MedicationService);
  private followUpService = inject(FollowUpService);
  private taskService = inject(RecoveryTaskService);
  private planService = inject(DischargePlanService);
  private riskService = inject(RiskAssessmentService);
  private toastService = inject(ToastService);

  patientId = signal<string>('');
  activeTab: 'plan' | 'medications' | 'followups' | 'tasks' = 'plan';

  isEditPatientOpen = signal(false);
  isDeletePatientOpen = signal(false);

  // Medication modal state
  isMedModalOpen = signal(false);
  editingMed?: Medication;
  medForm!: FormGroup;

  // Follow-Up modal state
  isFollowUpModalOpen = signal(false);
  editingFollowUp?: FollowUp;
  followUpForm!: FormGroup;

  // Recovery Task modal state
  isTaskModalOpen = signal(false);
  editingTask?: RecoveryTask;
  taskForm!: FormGroup;

  // Discharge Plan modal state
  isPlanModalOpen = signal(false);
  planForm!: FormGroup;

  // Confirmation dialog state
  isDeleteConfirmOpen = signal(false);
  deleteConfirmTitle = '';
  deleteConfirmMessage = '';
  pendingDeleteAction?: () => void;

  readonly defaultRedFlags = [
    'Fever above 100.4°F (38.0°C) or severe chills',
    'Severe sudden pain not relieved by prescribed medication',
    'Increasing localized redness, warmth, or drainage around surgical areas',
    'Shortness of breath, chest tightness, or rapid palpitations'
  ];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') || '';
      this.patientId.set(id);
    });

    this.initForms();
  }

  // Reactive computed patient domain data
  readonly patient = computed(() => {
    return this.patientService.patients().find(p => p.id === this.patientId());
  });

  readonly patientMedications = computed(() => {
    return this.medicationService.medications().filter(m => m.patientId === this.patientId());
  });

  readonly patientFollowUps = computed(() => {
    return this.followUpService.followUps()
      .filter(f => f.patientId === this.patientId())
      .sort((a, b) => parseLocalDate(a.appointmentDate).getTime() - parseLocalDate(b.appointmentDate).getTime());
  });

  readonly patientTasks = computed(() => {
    return this.taskService.tasks().filter(t => t.patientId === this.patientId());
  });

  readonly dischargePlan = computed(() => {
    return this.planService.dischargePlans().find(p => p.patientId === this.patientId());
  });

  // Dynamic Rule-Based Risk Summary
  readonly riskSummary = computed<RiskSummary>(() => {
    const p = this.patient();
    const followUps = this.patientFollowUps();
    const tasks = this.patientTasks();
    return this.riskService.calculateRisk(followUps, tasks, p?.dischargeDate);
  });

  // 5-Step Journey mapping
  readonly journeySteps = computed<JourneyStep[]>(() => {
    const p = this.patient();
    if (!p) return [];

    const meds = this.patientMedications();
    const followUps = this.patientFollowUps();
    const tasks = this.patientTasks();
    const risk = this.riskSummary();

    const activeMedsCount = meds.filter(m => m.status === 'active').length;
    const hasOverdueFollowUp = followUps.some(f => f.status === 'overdue');
    const allFollowUpsCompleted = followUps.length > 0 && followUps.every(f => f.status === 'completed');
    const completedTasksCount = tasks.filter(t => t.completed).length;

    return [
      {
        label: 'Discharged',
        sublabel: p.dischargeDate,
        status: 'completed'
      },
      {
        label: 'Medication Regimen',
        sublabel: activeMedsCount > 0 ? `${activeMedsCount} Active Meds` : 'Protocol Set',
        status: activeMedsCount > 0 ? 'completed' : 'current'
      },
      {
        label: 'Clinical Follow-Up',
        sublabel: hasOverdueFollowUp ? 'Follow-Up Overdue' : (allFollowUpsCompleted ? 'All Attended' : 'Scheduled'),
        status: hasOverdueFollowUp ? 'warning' : (allFollowUpsCompleted ? 'completed' : 'current')
      },
      {
        label: 'Recovery Milestones',
        sublabel: `${completedTasksCount}/${tasks.length} Tasks (${risk.completionPercentage}%)`,
        status: risk.completionPercentage >= 100 ? 'completed' : (risk.completionPercentage >= 50 ? 'current' : 'pending')
      },
      {
        label: 'Care Clearance',
        sublabel: p.status === 'completed' ? 'Goals Met' : 'In Progress',
        status: p.status === 'completed' ? 'completed' : 'pending'
      }
    ];
  });

  private initForms(): void {
    const todayStr = getLocalISODate();

    this.medForm = this.fb.group({
      name: ['', Validators.required],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      startDate: [todayStr, Validators.required],
      endDate: [todayStr, Validators.required],
      status: ['active', Validators.required],
      instructions: ['']
    });

    this.followUpForm = this.fb.group({
      title: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      department: ['', Validators.required],
      doctorName: ['', Validators.required],
      location: [''],
      status: ['upcoming', Validators.required],
      notes: ['']
    });

    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      category: ['Physical Therapy', Validators.required],
      dueDate: [todayStr, Validators.required],
      description: ['']
    });

    this.planForm = this.fb.group({
      summary: ['', Validators.required],
      careInstructions: ['', Validators.required],
      dietaryRestrictions: [''],
      activityRestrictions: [''],
      caregiverName: [''],
      caregiverPhone: ['']
    });
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const ctrl = form.get(fieldName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getInitials(name: string): string {
    if (!name) return 'PT';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  formatApptDate(dateStr: string): string {
    return formatReadableDateTime(dateStr);
  }

  isTaskOverdue(task: RecoveryTask): boolean {
    if (task.completed) return false;
    const due = parseLocalDate(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
  }

  // --- Patient Actions ---
  handleUpdatePatient(data: Omit<Patient, 'id'> | Patient): void {
    if ('id' in data) {
      this.patientService.updatePatient(data.id, data);
      this.toastService.success('Profile Updated', 'Patient record was successfully updated.');
    }
    this.isEditPatientOpen.set(false);
  }

  executeDeletePatient(): void {
    const p = this.patient();
    if (!p) return;
    const id = p.id;
    this.patientService.deletePatient(id);
    this.medicationService.deleteByPatientId(id);
    this.followUpService.deleteByPatientId(id);
    this.taskService.deleteByPatientId(id);
    this.planService.deleteByPatientId(id);

    this.toastService.info('Record Removed', `${p.fullName} was removed.`);
    this.isDeletePatientOpen.set(false);
    this.router.navigate(['/patients']);
  }

  // --- Discharge Plan Actions ---
  openEditPlanModal(): void {
    const currentPlan = this.dischargePlan();
    const currentPatient = this.patient();
    this.planForm.patchValue({
      summary: currentPlan?.summary || currentPatient?.notes || '',
      careInstructions: currentPlan?.careInstructions || '',
      dietaryRestrictions: currentPlan?.dietaryRestrictions || '',
      activityRestrictions: currentPlan?.activityRestrictions || '',
      caregiverName: currentPlan?.caregiverName || currentPatient?.emergencyContact || '',
      caregiverPhone: currentPlan?.caregiverPhone || ''
    });
    this.isPlanModalOpen.set(true);
  }

  saveDischargePlan(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    const formVal = this.planForm.value;
    const currentPlan = this.dischargePlan();

    if (currentPlan) {
      this.planService.updateDischargePlan(currentPlan.id, formVal);
      this.toastService.success('Discharge Plan Updated', 'Care guidelines and protocol saved.');
    } else {
      this.planService.addDischargePlan({
        ...formVal,
        patientId: this.patientId(),
        dischargeDate: this.patient()?.dischargeDate || getLocalISODate(),
        redFlags: this.defaultRedFlags
      });
      this.toastService.success('Discharge Plan Created', 'Care guidelines and protocol saved.');
    }
    this.isPlanModalOpen.set(false);
  }

  // --- Medication Actions ---
  openAddMedicationModal(): void {
    this.editingMed = undefined;
    const todayStr = getLocalISODate();
    this.medForm.reset({
      name: '',
      dosage: '',
      frequency: '',
      startDate: todayStr,
      endDate: todayStr,
      status: 'active',
      instructions: ''
    });
    this.isMedModalOpen.set(true);
  }

  openEditMedicationModal(med: Medication): void {
    this.editingMed = med;
    this.medForm.patchValue({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      startDate: med.startDate,
      endDate: med.endDate,
      status: med.status,
      instructions: med.instructions || ''
    });
    this.isMedModalOpen.set(true);
  }

  saveMedication(): void {
    if (this.medForm.invalid) {
      this.medForm.markAllAsTouched();
      return;
    }
    const formVal = this.medForm.value;

    if (this.editingMed) {
      this.medicationService.updateMedication(this.editingMed.id, formVal);
      this.toastService.success('Medication Updated', `${formVal.name} updated.`);
    } else {
      this.medicationService.addMedication({
        ...formVal,
        patientId: this.patientId()
      });
      this.toastService.success('Medication Added', `${formVal.name} added to protocol.`);
    }
    this.isMedModalOpen.set(false);
  }

  toggleMedStatus(id: string): void {
    const updated = this.medicationService.toggleMedicationStatus(id);
    if (updated) {
      this.toastService.info('Status Changed', `${updated.name} marked as ${updated.status}.`);
    }
  }

  confirmDeleteMed(med: Medication): void {
    this.deleteConfirmTitle = 'Remove Medication';
    this.deleteConfirmMessage = `Are you sure you want to remove ${med.name} from the medication schedule?`;
    this.pendingDeleteAction = () => {
      this.medicationService.deleteMedication(med.id);
      this.toastService.info('Medication Removed', `${med.name} was removed.`);
    };
    this.isDeleteConfirmOpen.set(true);
  }

  // --- Follow-Up Actions ---
  openAddFollowUpModal(): void {
    this.editingFollowUp = undefined;
    const now = new Date();
    now.setDate(now.getDate() + 3);
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    const defaultDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T10:00`;

    this.followUpForm.reset({
      title: '',
      appointmentDate: defaultDateTime,
      department: this.patient()?.department || 'General Clinic',
      doctorName: this.patient()?.assignedDoctor || 'Attending Physician',
      location: '',
      status: 'upcoming',
      notes: ''
    });
    this.isFollowUpModalOpen.set(true);
  }

  openEditFollowUpModal(f: FollowUp): void {
    this.editingFollowUp = f;
    this.followUpForm.patchValue({
      title: f.title,
      appointmentDate: f.appointmentDate,
      department: f.department,
      doctorName: f.doctorName,
      location: f.location || '',
      status: f.status,
      notes: f.notes || ''
    });
    this.isFollowUpModalOpen.set(true);
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
      this.followUpService.addFollowUp({
        ...formVal,
        patientId: this.patientId()
      });
      this.toastService.success('Follow-Up Scheduled', `${formVal.title} added to calendar.`);
    }
    this.isFollowUpModalOpen.set(false);
  }

  markFollowUpDone(id: string): void {
    this.followUpService.markCompleted(id);
    this.toastService.success('Follow-Up Completed', 'Appointment recorded as attended.');
  }

  confirmDeleteFollowUp(f: FollowUp): void {
    this.deleteConfirmTitle = 'Delete Follow-Up';
    this.deleteConfirmMessage = `Are you sure you want to delete "${f.title}"?`;
    this.pendingDeleteAction = () => {
      this.followUpService.deleteFollowUp(f.id);
      this.toastService.info('Appointment Removed', 'Follow-up appointment was removed.');
    };
    this.isDeleteConfirmOpen.set(true);
  }

  // --- Recovery Task Actions ---
  openAddTaskModal(): void {
    this.editingTask = undefined;
    const todayStr = getLocalISODate();
    this.taskForm.reset({
      title: '',
      category: 'Physical Therapy',
      dueDate: todayStr,
      description: ''
    });
    this.isTaskModalOpen.set(true);
  }

  openEditTaskModal(t: RecoveryTask): void {
    this.editingTask = t;
    this.taskForm.patchValue({
      title: t.title,
      category: t.category,
      dueDate: t.dueDate,
      description: t.description || ''
    });
    this.isTaskModalOpen.set(true);
  }

  saveTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    const formVal = this.taskForm.value;

    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask.id, formVal);
      this.toastService.success('Task Updated', `Task "${formVal.title}" updated.`);
    } else {
      this.taskService.addTask({
        ...formVal,
        patientId: this.patientId(),
        completed: false
      });
      this.toastService.success('Task Assigned', `Task "${formVal.title}" added to checklist.`);
    }
    this.isTaskModalOpen.set(false);
  }

  toggleTask(id: string): void {
    const updated = this.taskService.toggleTaskCompletion(id);
    if (updated) {
      if (updated.completed) {
        this.toastService.success('Task Completed', `"${updated.title}" marked completed.`);
      } else {
        this.toastService.info('Task Reopened', `"${updated.title}" marked incomplete.`);
      }
    }
  }

  confirmDeleteTask(t: RecoveryTask): void {
    this.deleteConfirmTitle = 'Delete Recovery Task';
    this.deleteConfirmMessage = `Are you sure you want to remove the task "${t.title}"?`;
    this.pendingDeleteAction = () => {
      this.taskService.deleteTask(t.id);
      this.toastService.info('Task Removed', 'Recovery task removed.');
    };
    this.isDeleteConfirmOpen.set(true);
  }

  executeConfirmedDelete(): void {
    if (this.pendingDeleteAction) {
      this.pendingDeleteAction();
    }
    this.isDeleteConfirmOpen.set(false);
    this.pendingDeleteAction = undefined;
  }

  onBackdropCloseMed(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) this.isMedModalOpen.set(false);
  }
  onBackdropCloseFollowUp(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) this.isFollowUpModalOpen.set(false);
  }
  onBackdropCloseTask(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) this.isTaskModalOpen.set(false);
  }
  onBackdropClosePlan(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) this.isPlanModalOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.isMedModalOpen.set(false);
    this.isFollowUpModalOpen.set(false);
    this.isTaskModalOpen.set(false);
    this.isPlanModalOpen.set(false);
    this.isEditPatientOpen.set(false);
    this.isDeletePatientOpen.set(false);
    this.isDeleteConfirmOpen.set(false);
  }
}
