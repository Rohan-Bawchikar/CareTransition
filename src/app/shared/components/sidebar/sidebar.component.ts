import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FollowUpService } from '../../../core/services/follow-up.service';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="app-sidebar" [class.open]="isOpen">
      <!-- Brand Header -->
      <div class="sidebar-brand">
        <div class="brand-logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <!-- Background circle with smooth medical gradient -->
            <rect width="32" height="32" rx="8" fill="url(#brand-grad)" />
            <!-- Stylized Medical Cross + Transition Forward Curve -->
            <path d="M16 8V24M8 16H24" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
            <path d="M20 12L24 16L20 20" stroke="#a7f3d0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            <defs>
              <linearGradient id="brand-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stop-color="#0f766e" />
                <stop offset="1" stop-color="#0369a1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-title">CareTransition</span>
          <span class="brand-subtitle">Post-Discharge Tracker</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="nav-section-label">MAIN NAVIGATION</div>

        <a 
          routerLink="/dashboard" 
          routerLinkActive="active" 
          class="nav-link"
          (click)="onNavigate()"
        >
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span class="nav-text">Dashboard</span>
        </a>

        <a 
          routerLink="/patients" 
          routerLinkActive="active" 
          class="nav-link"
          (click)="onNavigate()"
        >
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span class="nav-text">Patients</span>
          @if (dashboardService.patientAttentionList().length > 0) {
            <span class="nav-badge badge-warning" title="Patients requiring attention">
              {{ dashboardService.patientAttentionList().length }}
            </span>
          }
        </a>

        <a 
          routerLink="/follow-ups" 
          routerLinkActive="active" 
          class="nav-link"
          (click)="onNavigate()"
        >
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span class="nav-text">Follow-Ups</span>
          @if (dashboardService.overdueFollowUps().length > 0) {
            <span class="nav-badge badge-danger" title="Overdue follow-ups">
              {{ dashboardService.overdueFollowUps().length }}
            </span>
          }
        </a>

        <a 
          routerLink="/recovery-tasks" 
          routerLinkActive="active" 
          class="nav-link"
          (click)="onNavigate()"
        >
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          <span class="nav-text">Recovery Tasks</span>
        </a>

        <a 
          routerLink="/medications" 
          routerLinkActive="active" 
          class="nav-link"
          (click)="onNavigate()"
        >
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
            <path d="m8.5 8.5 7 7"></path>
          </svg>
          <span class="nav-text">Medications</span>
        </a>
      </nav>

      <!-- Risk Quick Summary Widget in Sidebar -->
      <div class="sidebar-footer">
        <div class="risk-card-mini">
          <div class="risk-card-header">
            <span class="mini-label">System Risk Distribution</span>
          </div>
          <div class="risk-bars-row">
            <div class="risk-pill pill-high" [title]="'High Risk: ' + dashboardService.riskCounts().high">
              <span class="pill-dot"></span>
              <span>{{ dashboardService.riskCounts().high }} High</span>
            </div>
            <div class="risk-pill pill-med" [title]="'Medium Risk: ' + dashboardService.riskCounts().medium">
              <span class="pill-dot"></span>
              <span>{{ dashboardService.riskCounts().medium }} Med</span>
            </div>
            <div class="risk-pill pill-low" [title]="'Low Risk: ' + dashboardService.riskCounts().low">
              <span class="pill-dot"></span>
              <span>{{ dashboardService.riskCounts().low }} Low</span>
            </div>
          </div>
        </div>

        <div class="app-version">
          <span>CareTransition v1.0.0</span>
          <span class="status-indicator">
            <span class="live-dot"></span> Online (Demo)
          </span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .app-sidebar {
      width: 260px;
      background-color: #0f172a;
      color: #94a3b8;
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: sticky;
      top: 0;
      z-index: 100;
      border-right: 1px solid #1e293b;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 22px 20px;
      border-bottom: 1px solid #1e293b;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: -0.02em;
    }

    .brand-subtitle {
      font-size: 0.7rem;
      color: #0d9488;
      font-weight: 500;
      letter-spacing: 0.02em;
    }

    .sidebar-nav {
      flex: 1;
      padding: 20px 14px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-section-label {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #64748b;
      padding: 8px 12px 6px;
      margin-top: 4px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.15s ease;
      position: relative;
    }

    .nav-link:hover {
      background-color: #1e293b;
      color: #f1f5f9;
    }

    .nav-link.active {
      background-color: #0f766e;
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(15, 118, 110, 0.35);
    }

    .nav-icon {
      flex-shrink: 0;
    }

    .nav-text {
      flex: 1;
    }

    .nav-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 9999px;
      line-height: 1;
    }

    .badge-danger {
      background-color: #e11d48;
      color: #ffffff;
    }

    .badge-warning {
      background-color: #d97706;
      color: #ffffff;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid #1e293b;
      background-color: #090e1a;
    }

    .risk-card-mini {
      background: #1e293b;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 12px;
      border: 1px solid #334155;
    }

    .mini-label {
      font-size: 0.7rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .risk-bars-row {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }

    .risk-pill {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 0.68rem;
      font-weight: 600;
      padding: 3px 4px;
      border-radius: 4px;
    }

    .pill-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
    }

    .pill-high {
      background: rgba(225, 29, 72, 0.15);
      color: #fda4af;
      .pill-dot { background: #e11d48; }
    }
    .pill-med {
      background: rgba(217, 119, 6, 0.15);
      color: #fcd34d;
      .pill-dot { background: #d97706; }
    }
    .pill-low {
      background: rgba(13, 148, 136, 0.15);
      color: #99f6e4;
      .pill-dot { background: #0d9488; }
    }

    .app-version {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.7rem;
      color: #64748b;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #10b981;
      font-weight: 500;
    }

    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }

    @media (max-width: 1024px) {
      .app-sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        transform: translateX(-100%);
      }

      .app-sidebar.open {
        transform: translateX(0);
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
      }
    }
  `]
})
export class SidebarComponent {
  followUpService = inject(FollowUpService);
  dashboardService = inject(DashboardService);

  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  onNavigate(): void {
    this.closeSidebar.emit();
  }
}
