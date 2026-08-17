import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { FollowUpService } from '../../../core/services/follow-up.service';
import { RecoveryTaskService } from '../../../core/services/recovery-task.service';
import { MedicationService } from '../../../core/services/medication.service';
import { DischargePlanService } from '../../../core/services/discharge-plan.service';
import { RiskAssessmentService } from '../../../core/services/risk-assessment.service';
import { ToastService } from '../../../core/services/toast.service';
import { Patient, PatientStatus } from '../../../core/models/patient.model';
import { RiskSummary, RiskLevel } from '../../../core/models/risk-summary.model';
import { RiskBadgeComponent } from '../../../shared/components/risk-badge/risk-badge.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { PatientFormComponent } from '../patient-form/patient-form.component';
import { parseLocalDate } from '../../../core/utils/date-utils';

export interface PatientListItem {
  patient: Patient;
  risk: RiskSummary;
  overdueFollowUpsCount: number;
}

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    RiskBadgeComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    ConfirmationDialogComponent,
    PatientFormComponent
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Patient Directory</h1>
          <p class="page-subtitle">Manage post-discharge tracking, care regimens, and risk statuses</p>
        </div>

        <button type="button" class="btn btn-primary" (click)="openAddModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Register New Patient</span>
        </button>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="toolbar-card">
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search by patient name, condition, or doctor..." 
            [(ngModel)]="searchQuery"
          />
          @if (searchQuery) {
            <button type="button" class="clear-search" (click)="searchQuery = ''">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          }
        </div>

        <div class="filters-group">
          <!-- Risk Level Filter -->
          <div class="filter-item">
            <label class="filter-label">Risk Level:</label>
            <select class="filter-select" [(ngModel)]="riskFilter">
              <option value="ALL">All Risk Tiers</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div class="filter-item">
            <label class="filter-label">Status:</label>
            <select class="filter-select" [(ngModel)]="statusFilter">
              <option value="ALL">All Statuses</option>
              <option value="active">Active</option>
              <option value="attention_needed">Attention Needed</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <!-- Sort Order -->
          <div class="filter-item">
            <label class="filter-label">Sort by:</label>
            <select class="filter-select" [(ngModel)]="sortBy">
              <option value="discharge_desc">Discharge Date (Newest)</option>
              <option value="discharge_asc">Discharge Date (Oldest)</option>
              <option value="risk_high">Risk Severity (Highest)</option>
              <option value="name_asc">Patient Name (A-Z)</option>
            </select>
          </div>

          <!-- View Toggle -->
          <div class="view-toggle">
            <button 
              type="button" 
              class="toggle-btn" 
              [class.active]="viewMode === 'grid'"
              (click)="viewMode = 'grid'"
              title="Grid View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button 
              type="button" 
              class="toggle-btn" 
              [class.active]="viewMode === 'table'"
              (click)="viewMode = 'table'"
              title="Table View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Results Count Bar -->
      <div class="results-meta">
        <span>Showing <strong>{{ filteredPatients().length }}</strong> of {{ patientService.patients().length }} patients</span>
        @if (searchQuery || riskFilter !== 'ALL' || statusFilter !== 'ALL') {
          <button type="button" class="btn-link" (click)="resetFilters()">Clear Filters</button>
        }
      </div>

      <!-- Content Area -->
      @if (filteredPatients().length === 0) {
        <app-empty-state
          title="No patients match your search"
          description="Try adjusting your search terms or filters to find what you are looking for."
          icon="patient"
          actionLabel="Clear All Filters"
          (action)="resetFilters()"
        ></app-empty-state>
      } @else if (viewMode === 'grid') {
        <!-- Grid View -->
        <div class="patients-grid">
          @for (item of filteredPatients(); track item.patient.id) {
            <div class="patient-card" [class.card-high-risk]="item.risk.level === 'HIGH'">
              <div class="card-top">
                <div class="patient-avatar">
                  {{ getInitials(item.patient.fullName) }}
                </div>
                <div class="patient-title-area">
                  <h3 class="patient-name">
                    <a [routerLink]="['/patients', item.patient.id]" class="name-link">
                      {{ item.patient.fullName }}
                    </a>
                  </h3>
                  <span class="patient-demographics">
                    {{ item.patient.age }} yrs • {{ item.patient.gender }}
                  </span>
                </div>
                <app-risk-badge [level]="item.risk.level" size="sm"></app-risk-badge>
              </div>

              <div class="card-condition">
                <span class="condition-badge">{{ item.patient.primaryCondition }}</span>
              </div>

              <!-- Risk Factor Callout if High/Medium -->
              <div class="card-risk-reason" [ngClass]="'reason-' + item.risk.level.toLowerCase()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{{ item.risk.reason }}</span>
              </div>

              <!-- Metadata Grid -->
              <div class="card-meta-grid">
                <div class="meta-item">
                  <span class="meta-label">Discharged:</span>
                  <span class="meta-val">{{ item.patient.dischargeDate }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Attending:</span>
                  <span class="meta-val">{{ item.patient.assignedDoctor }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Recovery:</span>
                  <span class="meta-val highlight">{{ item.risk.completionPercentage }}% Tasks</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Status:</span>
                  <app-status-badge [status]="item.patient.status" size="sm"></app-status-badge>
                </div>
              </div>

              <!-- Card Actions Footer -->
              <div class="card-footer">
                <a [routerLink]="['/patients', item.patient.id]" class="btn-card-action btn-view">
                  View Journey
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
                <div class="action-btn-group">
                  <button 
                    type="button" 
                    class="btn-icon" 
                    (click)="openEditModal(item.patient)" 
                    title="Edit Patient"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button 
                    type="button" 
                    class="btn-icon btn-icon-danger" 
                    (click)="confirmDeletePatient(item.patient)" 
                    title="Delete Patient"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- Table View -->
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Diagnosis & Dept</th>
                <th>Discharge Date</th>
                <th>Assigned Doctor</th>
                <th>Risk Indicator</th>
                <th>Recovery Tasks</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (item of filteredPatients(); track item.patient.id) {
                <tr [class.row-attention]="item.risk.level === 'HIGH'">
                  <td>
                    <div class="table-patient-cell">
                      <div class="table-avatar">{{ getInitials(item.patient.fullName) }}</div>
                      <div>
                        <a [routerLink]="['/patients', item.patient.id]" class="table-name-link">
                          {{ item.patient.fullName }}
                        </a>
                        <div class="table-sub">{{ item.patient.age }} yrs • {{ item.patient.gender }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="table-condition">{{ item.patient.primaryCondition }}</div>
                    <div class="table-sub">{{ item.patient.department || 'General Care' }}</div>
                  </td>
                  <td>
                    <span class="table-date">{{ item.patient.dischargeDate }}</span>
                  </td>
                  <td>
                    <span class="table-doctor">{{ item.patient.assignedDoctor }}</span>
                  </td>
                  <td>
                    <app-risk-badge [level]="item.risk.level" size="sm"></app-risk-badge>
                    <div class="table-risk-reason">{{ item.risk.reason }}</div>
                  </td>
                  <td>
                    <div class="table-progress">
                      <div class="progress-bar-mini">
                        <div 
                          class="progress-bar-fill" 
                          [style.width.%]="item.risk.completionPercentage"
                          [ngClass]="item.risk.completionPercentage >= 75 ? 'fill-good' : (item.risk.completionPercentage >= 40 ? 'fill-warn' : 'fill-danger')"
                        ></div>
                      </div>
                      <span class="progress-pct">{{ item.risk.completionPercentage }}%</span>
                    </div>
                  </td>
                  <td>
                    <app-status-badge [status]="item.patient.status" size="sm"></app-status-badge>
                  </td>
                  <td class="text-right">
                    <div class="table-actions">
                      <a [routerLink]="['/patients', item.patient.id]" class="btn-sm btn-outline">
                        View
                      </a>
                      <button type="button" class="btn-icon" (click)="openEditModal(item.patient)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button type="button" class="btn-icon btn-icon-danger" (click)="confirmDeletePatient(item.patient)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Patient Form Modal -->
    <app-patient-form
      [isOpen]="isFormOpen()"
      [patientToEdit]="editingPatient"
      (save)="handleSavePatient($event)"
      (cancel)="isFormOpen.set(false)"
    ></app-patient-form>

    <!-- Delete Confirmation Modal -->
    <app-confirmation-dialog
      [isOpen]="isDeleteOpen()"
      title="Delete Patient Record?"
      [message]="'Are you sure you want to remove ' + (deletingPatient?.fullName || 'this patient') + '? This will also remove their associated medications, follow-ups, and recovery tasks.'"
      confirmText="Delete Record"
      cancelText="Cancel"
      [isDestructive]="true"
      (confirm)="executeDeletePatient()"
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
      padding: 16px 20px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      margin-bottom: 16px;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 280px;
      max-width: 440px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    .search-input {
      width: 100%;
      padding: 9px 36px 9px 38px;
      font-size: 0.88rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      color: #1e293b;
      outline: none;
      transition: all 0.15s ease;
    }

    .search-input:focus {
      border-color: #0d9488;
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
    }

    .clear-search {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
    }

    .filters-group {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .filter-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .filter-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
    }

    .filter-select {
      padding: 7px 10px;
      font-size: 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      color: #1e293b;
      background: #ffffff;
      outline: none;
      cursor: pointer;
    }

    .filter-select:focus {
      border-color: #0d9488;
    }

    .view-toggle {
      display: flex;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      margin-left: 4px;
    }

    .toggle-btn {
      background: #ffffff;
      border: none;
      padding: 7px 10px;
      cursor: pointer;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toggle-btn.active {
      background: #0f766e;
      color: #ffffff;
    }

    .results-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.85rem;
      color: #64748b;
      margin-bottom: 18px;
      padding: 0 4px;
    }

    .btn-link {
      background: none;
      border: none;
      color: #0d9488;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }
    .btn-link:hover {
      text-decoration: underline;
    }

    /* Grid View Cards */
    .patients-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .patient-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;
      position: relative;
    }

    .patient-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -3px rgba(0, 0, 0, 0.06);
      border-color: #cbd5e1;
    }

    .patient-card.card-high-risk {
      border-left: 4px solid #e11d48;
    }

    .card-top {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
    }

    .patient-avatar {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: #0f766e;
      color: #ffffff;
      font-size: 0.95rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .patient-title-area {
      flex: 1;
    }

    .patient-name {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0 0 2px;
    }

    .name-link {
      color: #0f172a;
      text-decoration: none;
    }
    .name-link:hover {
      color: #0d9488;
    }

    .patient-demographics {
      font-size: 0.78rem;
      color: #64748b;
    }

    .card-condition {
      margin-bottom: 12px;
    }

    .condition-badge {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 600;
      color: #0369a1;
      background: #f0f9ff;
      border: 1px solid #e0f2fe;
      padding: 4px 10px;
      border-radius: 6px;
    }

    .card-risk-reason {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 500;
      margin-bottom: 14px;
      line-height: 1.4;
    }

    .reason-high {
      background: #fff1f2;
      color: #be123c;
      border: 1px solid #fecdd3;
    }
    .reason-medium {
      background: #fffbeb;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .reason-low {
      background: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .card-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 12px;
      padding: 12px 0;
      border-top: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 16px;
      font-size: 0.8rem;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .meta-label {
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .meta-val {
      color: #1e293b;
      font-weight: 600;
    }

    .meta-val.highlight {
      color: #0d9488;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
    }

    .btn-card-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.84rem;
      font-weight: 600;
      text-decoration: none;
      padding: 7px 14px;
      border-radius: 8px;
      transition: all 0.15s ease;
    }

    .btn-view {
      background: #f0fdfa;
      color: #0f766e;
      border: 1px solid #ccfbf1;
    }
    .btn-view:hover {
      background: #0d9488;
      color: #ffffff;
    }

    .action-btn-group {
      display: flex;
      align-items: center;
      gap: 6px;
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

    /* Table Styles */
    .table-wrapper {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow-x: auto;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;
    }

    .data-table th {
      background: #f8fafc;
      padding: 12px 16px;
      font-weight: 600;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .data-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
      vertical-align: middle;
    }

    .data-table tbody tr:hover {
      background-color: #f8fafc;
    }

    .data-table tr.row-attention {
      background-color: #fffbfb;
    }

    .table-patient-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .table-avatar {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #0f766e;
      color: #ffffff;
      font-size: 0.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .table-name-link {
      font-weight: 600;
      color: #0f172a;
      text-decoration: none;
    }
    .table-name-link:hover {
      color: #0d9488;
    }

    .table-sub {
      font-size: 0.75rem;
      color: #64748b;
    }

    .table-condition {
      font-weight: 500;
    }

    .table-date, .table-doctor {
      font-size: 0.82rem;
      color: #334155;
    }

    .table-risk-reason {
      font-size: 0.72rem;
      color: #64748b;
      margin-top: 3px;
      max-width: 200px;
    }

    .table-progress {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-bar-mini {
      width: 70px;
      height: 6px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      border-radius: 9999px;
    }

    .fill-good { background-color: #10b981; }
    .fill-warn { background-color: #f59e0b; }
    .fill-danger { background-color: #e11d48; }

    .progress-pct {
      font-size: 0.78rem;
      font-weight: 600;
    }

    .table-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
    }

    .btn-sm {
      padding: 5px 10px;
      font-size: 0.78rem;
      font-weight: 600;
      border-radius: 6px;
      text-decoration: none;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #0d9488;
      color: #ffffff;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-primary:hover {
      background: #0f766e;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
    }

    .text-right {
      text-align: right;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 16px;
      }
      .page-header {
        flex-direction: column;
      }
      .toolbar-card {
        flex-direction: column;
        align-items: stretch;
      }
      .search-box {
        max-width: 100%;
      }
      .filters-group {
        flex-direction: column;
        align-items: stretch;
      }
      .filter-item {
        justify-content: space-between;
      }
      .patients-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PatientListComponent {
  patientService = inject(PatientService);
  private followUpService = inject(FollowUpService);
  private taskService = inject(RecoveryTaskService);
  private medService = inject(MedicationService);
  private planService = inject(DischargePlanService);
  private riskService = inject(RiskAssessmentService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  searchQuery = '';
  riskFilter: 'ALL' | RiskLevel = 'ALL';
  statusFilter: 'ALL' | PatientStatus = 'ALL';
  sortBy: 'discharge_desc' | 'discharge_asc' | 'risk_high' | 'name_asc' = 'discharge_desc';
  viewMode: 'grid' | 'table' = 'grid';

  isFormOpen = signal(false);
  isDeleteOpen = signal(false);
  editingPatient?: Patient;
  deletingPatient?: Patient;

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'new') {
        this.openAddModal();
      }
    });
  }

  // Computed list of patients enriched with calculated risk summaries
  readonly enrichedPatients = computed<PatientListItem[]>(() => {
    const patients = this.patientService.patients();
    const followUps = this.followUpService.followUps();
    const tasks = this.taskService.tasks();

    return patients.map(patient => {
      const pFollowUps = followUps.filter(f => f.patientId === patient.id);
      const pTasks = tasks.filter(t => t.patientId === patient.id);
      const risk = this.riskService.calculateRisk(pFollowUps, pTasks, patient.dischargeDate);
      const overdueCount = pFollowUps.filter(f => f.status === 'overdue').length;

      return {
        patient,
        risk,
        overdueFollowUpsCount: overdueCount
      };
    });
  });

  // Filtered and sorted patient list
  readonly filteredPatients = computed(() => {
    let items = this.enrichedPatients();

    // 1. Search Query filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      items = items.filter(item => {
        const p = item.patient;
        return (
          p.fullName.toLowerCase().includes(q) ||
          p.primaryCondition.toLowerCase().includes(q) ||
          p.assignedDoctor.toLowerCase().includes(q) ||
          p.contactNumber.toLowerCase().includes(q) ||
          (p.department && p.department.toLowerCase().includes(q))
        );
      });
    }

    // 2. Risk Level filter
    if (this.riskFilter !== 'ALL') {
      items = items.filter(item => item.risk.level === this.riskFilter);
    }

    // 3. Status filter
    if (this.statusFilter !== 'ALL') {
      items = items.filter(item => item.patient.status === this.statusFilter);
    }

    // 4. Sorting
    items = [...items].sort((a, b) => {
      if (this.sortBy === 'discharge_desc') {
        return parseLocalDate(b.patient.dischargeDate).getTime() - parseLocalDate(a.patient.dischargeDate).getTime();
      } else if (this.sortBy === 'discharge_asc') {
        return parseLocalDate(a.patient.dischargeDate).getTime() - parseLocalDate(b.patient.dischargeDate).getTime();
      } else if (this.sortBy === 'risk_high') {
        return b.risk.score - a.risk.score;
      } else if (this.sortBy === 'name_asc') {
        return a.patient.fullName.localeCompare(b.patient.fullName);
      }
      return 0;
    });

    return items;
  });

  getInitials(name: string): string {
    if (!name) return 'PT';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.riskFilter = 'ALL';
    this.statusFilter = 'ALL';
    this.sortBy = 'discharge_desc';
  }

  openAddModal(): void {
    this.editingPatient = undefined;
    this.isFormOpen.set(true);
  }

  openEditModal(patient: Patient): void {
    this.editingPatient = patient;
    this.isFormOpen.set(true);
  }

  handleSavePatient(data: Omit<Patient, 'id'> | Patient): void {
    if ('id' in data) {
      this.patientService.updatePatient(data.id, data);
      this.toastService.success('Patient Updated', `${data.fullName}'s clinical profile was successfully updated.`);
    } else {
      const created = this.patientService.addPatient(data);
      this.toastService.success('Patient Registered', `${created.fullName} has been added to post-discharge care.`);
    }
    this.isFormOpen.set(false);
  }

  confirmDeletePatient(patient: Patient): void {
    this.deletingPatient = patient;
    this.isDeleteOpen.set(true);
  }

  executeDeletePatient(): void {
    if (!this.deletingPatient) return;
    const name = this.deletingPatient.fullName;
    const id = this.deletingPatient.id;

    // Delete patient and cascade remove associated items
    this.patientService.deletePatient(id);
    this.medService.deleteByPatientId(id);
    this.followUpService.deleteByPatientId(id);
    this.taskService.deleteByPatientId(id);
    this.planService.deleteByPatientId(id);

    this.toastService.info('Record Deleted', `${name} and associated records were removed.`);
    this.isDeleteOpen.set(false);
    this.deletingPatient = undefined;
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.isFormOpen.set(false);
    this.isDeleteOpen.set(false);
  }
}
