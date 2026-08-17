import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { PatientService } from '../../core/services/patient.service';
import { FollowUpService } from '../../core/services/follow-up.service';
import { ToastService } from '../../core/services/toast.service';
import { FollowUp } from '../../core/models/follow-up.model';
import { RiskBadgeComponent } from '../../shared/components/risk-badge/risk-badge.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ProgressCardComponent } from '../../shared/components/progress-card/progress-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RiskBadgeComponent,
    StatusBadgeComponent,
    ProgressCardComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="dashboard-page">
      <!-- Premium Hero Section with Subtle Parallax Shapes -->
      <section class="dashboard-hero">
        <div class="hero-parallax-bg" aria-hidden="true">
          <div class="orb orb-1"></div>
          <div class="orb orb-2"></div>
          <div class="orb orb-3"></div>
          <div class="grid-mesh"></div>
        </div>

        <div class="hero-content">
          <div class="hero-tag">
            <span class="hero-pulse"></span>
            <span>POST-DISCHARGE CLINICAL INTELLIGENCE</span>
          </div>

          <h1 class="hero-title">Care beyond discharge.</h1>
          <p class="hero-subtitle">
            Track follow-ups, recovery tasks, and patient progress in one place. Proactively prevent hospital readmissions with rule-based risk tracking.
          </p>

          <!-- Subtle Patient Journey Flow Indicator in Hero -->
          <div class="hero-flow-diagram">
            <div class="flow-node">
              <div class="flow-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
              </div>
              <span>Discharge</span>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-node">
              <div class="flow-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
                </svg>
              </div>
              <span>Medication</span>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-node">
              <div class="flow-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                </svg>
              </div>
              <span>Follow-Up</span>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-node">
              <div class="flow-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M9 11l3 3L22 4"></path>
                </svg>
              </div>
              <span>Recovery Tasks</span>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-node active">
              <div class="flow-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span>Recovery Clearance</span>
            </div>
          </div>
        </div>
      </section>

      <!-- KPI Summary Cards -->
      <section class="kpi-grid">
        <!-- 1. Total Active Patients -->
        <div class="kpi-card">
          <div class="kpi-icon icon-teal">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-number">{{ dashboardService.activePatients().length }}</span>
            <span class="kpi-label">Active Tracked Patients</span>
            <span class="kpi-subtext">Total {{ dashboardService.totalPatientsCount() }} registered</span>
          </div>
        </div>

        <!-- 2. Recent Discharges (7 Days) -->
        <div class="kpi-card">
          <div class="kpi-icon icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-number">{{ dashboardService.recentDischarges().length }}</span>
            <span class="kpi-label">Recent Discharges</span>
            <span class="kpi-subtext">Discharged in last 7 days</span>
          </div>
        </div>

        <!-- 3. Follow-Ups Today -->
        <div class="kpi-card">
          <div class="kpi-icon icon-cyan">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-number">{{ dashboardService.todayFollowUps().length }}</span>
            <span class="kpi-label">Follow-Ups Today</span>
            <span class="kpi-subtext">Scheduled clinical reviews</span>
          </div>
        </div>

        <!-- 4. Pending Follow-Ups -->
        <div class="kpi-card">
          <div class="kpi-icon icon-indigo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-number">{{ dashboardService.pendingFollowUps().length }}</span>
            <span class="kpi-label">Upcoming Follow-Ups</span>
            <span class="kpi-subtext">Scheduled on calendar</span>
          </div>
        </div>

        <!-- 5. Overdue Follow-Ups -->
        <div class="kpi-card" [class.kpi-card-danger]="dashboardService.overdueFollowUps().length > 0">
          <div class="kpi-icon icon-rose">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-number text-danger">{{ dashboardService.overdueFollowUps().length }}</span>
            <span class="kpi-label">Overdue Follow-Ups</span>
            <span class="kpi-subtext text-danger">Immediate action required</span>
          </div>
        </div>

        <!-- 6. Recovery Progress % -->
        <div class="kpi-card">
          <div class="kpi-icon icon-emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-number text-emerald">{{ dashboardService.overallRecoveryProgress() }}%</span>
            <span class="kpi-label">System Recovery Rate</span>
            <span class="kpi-subtext">Checklist task completion</span>
          </div>
        </div>
      </section>

      <!-- Main Dashboard 2-Column Layout -->
      <div class="dashboard-grid">
        <!-- Left Column: Attention Needed & Upcoming Schedule -->
        <div class="dash-col-main">
          <!-- Patients Requiring Attention Widget -->
          <div class="dash-card">
            <div class="dash-card-header">
              <div class="header-left">
                <div class="alert-dot"></div>
                <h2 class="card-title">Patients Requiring Immediate Attention</h2>
              </div>
              <a routerLink="/patients" class="header-link">View All Patients →</a>
            </div>

            @if (dashboardService.patientAttentionList().length === 0) {
              <app-empty-state
                title="All patients on track"
                description="There are currently no patients flagged for overdue follow-ups or critical risk factors."
                icon="patient"
              ></app-empty-state>
            } @else {
              <div class="attention-list">
                @for (item of dashboardService.patientAttentionList(); track item.patient.id) {
                  <div class="attention-item" [class.item-high-risk]="item.risk.level === 'HIGH'">
                    <div class="attention-patient-meta">
                      <div class="patient-avatar-sm">
                        {{ getInitials(item.patient.fullName) }}
                      </div>
                      <div class="patient-name-info">
                        <h4 class="name-title">
                          <a [routerLink]="['/patients', item.patient.id]" class="name-link">
                            {{ item.patient.fullName }}
                          </a>
                        </h4>
                        <span class="sub-condition">{{ item.patient.primaryCondition }} • Dr. {{ item.patient.assignedDoctor }}</span>
                      </div>
                    </div>

                    <div class="attention-risk-meta">
                      <app-risk-badge [level]="item.risk.level" size="sm"></app-risk-badge>
                      <span class="risk-reason-text">{{ item.risk.reason }}</span>
                    </div>

                    <div class="attention-action">
                      <a [routerLink]="['/patients', item.patient.id]" class="btn-sm btn-outline">
                        Manage Patient
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </a>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Today & Upcoming Follow-Ups Widget -->
          <div class="dash-card">
            <div class="dash-card-header">
              <div class="header-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="header-icon">
                  <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                </svg>
                <h2 class="card-title">Today & Upcoming Follow-Up Reviews</h2>
              </div>
              <a routerLink="/follow-ups" class="header-link">Full Schedule →</a>
            </div>

            @if (upcomingAndOverdueFollowUps().length === 0) {
              <app-empty-state
                title="No pending follow-ups"
                description="All scheduled follow-up visits are completed."
                icon="calendar"
              ></app-empty-state>
            } @else {
              <div class="followup-list">
                @for (f of upcomingAndOverdueFollowUps(); track f.id) {
                  <div class="followup-row" [class.row-overdue]="f.status === 'overdue'">
                    <div class="flw-date-box">
                      <span class="date-day">{{ getApptDay(f.appointmentDate) }}</span>
                      <span class="date-month">{{ getApptMonth(f.appointmentDate) }}</span>
                    </div>

                    <div class="flw-info">
                      <h4 class="flw-title">{{ f.title }}</h4>
                      <div class="flw-meta">
                        <span class="flw-patient">Patient: <strong>{{ getPatientName(f.patientId) }}</strong></span> • 
                        <span class="flw-doctor">{{ f.doctorName }} ({{ f.department }})</span>
                      </div>
                    </div>

                    <div class="flw-status">
                      <app-status-badge [status]="f.status" size="sm"></app-status-badge>
                    </div>

                    <div class="flw-action">
                      @if (f.status !== 'completed') {
                        <button type="button" class="btn-check-sm" (click)="markComplete(f.id)" title="Mark completed">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                      }
                      <a [routerLink]="['/patients', f.patientId]" class="btn-icon" title="View Patient Details">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </a>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Right Column: Recent Discharges & System Overview -->
        <div class="dash-col-side">
          <!-- Risk Distribution Breakdown -->
          <div class="dash-card">
            <h3 class="card-title-side">Risk Stratification</h3>
            <p class="card-subtitle-side">Live patient risk distribution</p>

            <div class="risk-distribution-box">
              <div class="dist-row">
                <div class="dist-lbl">
                  <span class="dist-dot dot-high"></span>
                  <span>High Risk (Attention Needed)</span>
                </div>
                <span class="dist-count count-high">{{ dashboardService.riskCounts().high }}</span>
              </div>
              <div class="dist-row">
                <div class="dist-lbl">
                  <span class="dist-dot dot-med"></span>
                  <span>Medium Risk (Pending Tasks)</span>
                </div>
                <span class="dist-count count-med">{{ dashboardService.riskCounts().medium }}</span>
              </div>
              <div class="dist-row">
                <div class="dist-lbl">
                  <span class="dist-dot dot-low"></span>
                  <span>Low Risk (On Track)</span>
                </div>
                <span class="dist-count count-low">{{ dashboardService.riskCounts().low }}</span>
              </div>
            </div>

            <div class="risk-stacked-bar">
              <div 
                class="bar-slice slice-high" 
                [style.width.%]="getRiskPercentage('high')"
                title="High Risk"
              ></div>
              <div 
                class="bar-slice slice-med" 
                [style.width.%]="getRiskPercentage('medium')"
                title="Medium Risk"
              ></div>
              <div 
                class="bar-slice slice-low" 
                [style.width.%]="getRiskPercentage('low')"
                title="Low Risk"
              ></div>
            </div>
          </div>

          <!-- Overall Recovery Adherence Card -->
          <div class="dash-card">
            <h3 class="card-title-side">Recovery Adherence</h3>
            <p class="card-subtitle-side">Task completion across all cohorts</p>
            
            <app-progress-card
              title="Global Task Completion"
              [percentage]="dashboardService.overallRecoveryProgress()"
              subtitle="Calculated from all active patient recovery checklists"
            ></app-progress-card>
          </div>

          <!-- Recent Discharges -->
          <div class="dash-card">
            <div class="dash-card-header">
              <h3 class="card-title-side">Recent Discharges</h3>
              <a routerLink="/patients" class="header-link">Directory →</a>
            </div>
            <p class="card-subtitle-side">Patients discharged in last 7 days</p>

            <div class="discharges-list">
              @for (p of dashboardService.recentDischarges(); track p.id) {
                <div class="discharge-item">
                  <div class="discharge-avatar">{{ getInitials(p.fullName) }}</div>
                  <div class="discharge-info">
                    <h5 class="discharge-name">
                      <a [routerLink]="['/patients', p.id]" class="name-link">{{ p.fullName }}</a>
                    </h5>
                    <span class="discharge-condition">{{ p.primaryCondition }}</span>
                  </div>
                  <span class="discharge-date">{{ p.dischargeDate }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 24px 32px;
      max-width: 1440px;
      margin: 0 auto;
    }

    /* Hero Section with Parallax Decor */
    .dashboard-hero {
      position: relative;
      background: linear-gradient(135deg, #0f172a 0%, #134e4a 100%);
      border-radius: 16px;
      padding: 32px 36px;
      color: #ffffff;
      margin-bottom: 24px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.2);
    }

    .hero-parallax-bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(50px);
      opacity: 0.35;
      animation: floatOrb 8s ease-in-out infinite alternate;
    }

    .orb-1 {
      width: 260px;
      height: 260px;
      background: #0d9488;
      top: -80px;
      right: 10%;
    }

    .orb-2 {
      width: 200px;
      height: 200px;
      background: #0284c7;
      bottom: -60px;
      right: 35%;
      animation-delay: 2s;
    }

    .orb-3 {
      width: 180px;
      height: 180px;
      background: #14b8a6;
      top: 20px;
      left: 60%;
      animation-delay: 4s;
    }

    .grid-mesh {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
      background-size: 24px 24px;
    }

    @keyframes floatOrb {
      0% { transform: translateY(0px) scale(1); }
      100% { transform: translateY(20px) scale(1.08); }
    }

    @media (prefers-reduced-motion: reduce) {
      .orb {
        animation: none !important;
      }
    }

    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 800px;
    }

    .hero-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #5eead4;
      background: rgba(13, 148, 136, 0.25);
      border: 1px solid rgba(94, 234, 212, 0.3);
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 12px;
    }

    .hero-pulse {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #5eead4;
      box-shadow: 0 0 8px #5eead4;
    }

    .hero-title {
      font-size: 2rem;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: -0.03em;
      margin: 0 0 10px;
      line-height: 1.15;
    }

    .hero-subtitle {
      font-size: 0.95rem;
      color: #cbd5e1;
      line-height: 1.5;
      margin: 0 0 20px;
      max-width: 680px;
    }

    .hero-flow-diagram {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 8px 16px;
      border-radius: 10px;
      width: fit-content;
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .flow-node {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
    }
    .flow-node.active {
      color: #5eead4;
      font-weight: 700;
    }

    .flow-icon {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .flow-arrow {
      color: #64748b;
      font-size: 0.85rem;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .kpi-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 18px;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    }

    .kpi-card.kpi-card-danger {
      border-left: 4px solid #e11d48;
    }

    .kpi-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-teal { background: #f0fdfa; color: #0d9488; }
    .icon-blue { background: #eff6ff; color: #2563eb; }
    .icon-cyan { background: #ecfeff; color: #0891b2; }
    .icon-indigo { background: #eef2ff; color: #4f46e5; }
    .icon-rose { background: #fff1f2; color: #e11d48; }
    .icon-emerald { background: #ecfdf5; color: #059669; }

    .kpi-info {
      display: flex;
      flex-direction: column;
    }

    .kpi-number {
      font-size: 1.45rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
    }

    .kpi-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: #475569;
      margin: 2px 0;
    }

    .kpi-subtext {
      font-size: 0.7rem;
      color: #94a3b8;
    }

    .text-danger { color: #e11d48; }
    .text-emerald { color: #059669; }

    /* Dashboard 2-Column Grid */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 24px;
    }

    .dash-col-main, .dash-col-side {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .dash-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }

    .dash-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .alert-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #e11d48;
      box-shadow: 0 0 8px #e11d48;
    }

    .header-icon {
      color: #0d9488;
    }

    .card-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .header-link {
      font-size: 0.82rem;
      font-weight: 600;
      color: #0f766e;
      text-decoration: none;
    }
    .header-link:hover {
      text-decoration: underline;
    }

    .card-title-side {
      font-size: 0.98rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 2px;
    }

    .card-subtitle-side {
      font-size: 0.78rem;
      color: #64748b;
      margin: 0 0 14px;
    }

    /* Attention List */
    .attention-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .attention-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      transition: all 0.15s ease;
    }

    .attention-item:hover {
      background: #ffffff;
      border-color: #cbd5e1;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
    }

    .attention-item.item-high-risk {
      border-left: 4px solid #e11d48;
      background: #fffbfb;
    }

    .attention-patient-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 220px;
    }

    .patient-avatar-sm {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      background: #0f766e;
      color: #ffffff;
      font-size: 0.84rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .name-title {
      font-size: 0.92rem;
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

    .sub-condition {
      font-size: 0.75rem;
      color: #64748b;
    }

    .attention-risk-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .risk-reason-text {
      font-size: 0.78rem;
      color: #475569;
      line-height: 1.3;
    }

    /* Followup rows */
    .followup-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .followup-row {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 14px;
      transition: all 0.15s ease;
    }

    .followup-row:hover {
      border-color: #cbd5e1;
    }

    .followup-row.row-overdue {
      border-left: 4px solid #e11d48;
      background: #fffbfb;
    }

    .flw-date-box {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      background: #f1f5f9;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .date-day {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1;
    }
    .date-month {
      font-size: 0.65rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }

    .flw-info {
      flex: 1;
    }

    .flw-title {
      font-size: 0.88rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 2px;
    }

    .flw-meta {
      font-size: 0.75rem;
      color: #64748b;
    }

    .flw-action {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-check-sm {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      border-radius: 6px;
      padding: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-check-sm:hover {
      background: #10b981;
      color: #ffffff;
    }

    .btn-sm {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 10px;
      font-size: 0.78rem;
      font-weight: 600;
      border-radius: 6px;
      text-decoration: none;
    }
    .btn-outline {
      background: #ffffff;
      color: #0f766e;
      border: 1px solid #ccfbf1;
    }
    .btn-outline:hover {
      background: #0f766e;
      color: #ffffff;
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
      text-decoration: none;
    }
    .btn-icon:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    /* Risk Distribution Widget */
    .risk-distribution-box {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 14px;
    }

    .dist-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8rem;
    }

    .dist-lbl {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #475569;
    }

    .dist-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .dot-high { background: #e11d48; }
    .dot-med { background: #d97706; }
    .dot-low { background: #0d9488; }

    .dist-count {
      font-weight: 700;
      padding: 1px 8px;
      border-radius: 9999px;
      font-size: 0.75rem;
    }
    .count-high { background: #fff1f2; color: #be123c; }
    .count-med { background: #fffbeb; color: #b45309; }
    .count-low { background: #f0fdf4; color: #047857; }

    .risk-stacked-bar {
      height: 8px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
      display: flex;
    }

    .bar-slice {
      height: 100%;
      transition: width 0.4s ease;
    }
    .slice-high { background: #e11d48; }
    .slice-med { background: #f59e0b; }
    .slice-low { background: #0d9488; }

    /* Recent Discharges */
    .discharges-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .discharge-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .discharge-item:last-child {
      border-bottom: none;
    }

    .discharge-avatar {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: #0f766e;
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .discharge-info {
      flex: 1;
    }

    .discharge-name {
      font-size: 0.84rem;
      font-weight: 600;
      margin: 0;
    }

    .discharge-condition {
      font-size: 0.72rem;
      color: #64748b;
      display: block;
    }

    .discharge-date {
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 500;
    }

    @media (max-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .dashboard-page {
        padding: 16px;
      }
      .dashboard-hero {
        padding: 24px 20px;
      }
      .hero-title {
        font-size: 1.6rem;
      }
      .hero-flow-diagram {
        display: none;
      }
      .kpi-grid {
        grid-template-columns: 1fr 1fr;
      }
      .attention-item {
        flex-direction: column;
        align-items: flex-start;
      }
      .attention-action {
        align-self: flex-end;
      }
    }
  `]
})
export class DashboardComponent {
  dashboardService = inject(DashboardService);
  private patientService = inject(PatientService);
  private followUpService = inject(FollowUpService);
  private toastService = inject(ToastService);

  upcomingAndOverdueFollowUps(): FollowUp[] {
    return this.followUpService.followUps()
      .filter(f => f.status === 'overdue' || f.status === 'upcoming')
      .sort((a, b) => {
        // Overdue first
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (b.status === 'overdue' && a.status !== 'overdue') return 1;
        return new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime();
      })
      .slice(0, 5);
  }

  getPatientName(patientId: string): string {
    const p = this.patientService.getPatientById(patientId);
    return p ? p.fullName : 'Patient';
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

  getApptDay(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.getDate().toString();
    } catch {
      return '';
    }
  }

  getApptMonth(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString(undefined, { month: 'short' });
    } catch {
      return '';
    }
  }

  getRiskPercentage(level: 'high' | 'medium' | 'low'): number {
    const counts = this.dashboardService.riskCounts();
    if (counts.total === 0) return 0;
    return Math.round((counts[level] / counts.total) * 100);
  }

  markComplete(followUpId: string): void {
    this.followUpService.markCompleted(followUpId);
    this.toastService.success('Follow-Up Attended', 'Appointment marked as completed.');
  }
}
