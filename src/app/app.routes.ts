import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard | CareTransition'
  },
  {
    path: 'patients',
    loadComponent: () => import('./features/patients/patient-list/patient-list.component').then(m => m.PatientListComponent),
    title: 'Patients | CareTransition'
  },
  {
    path: 'patients/:id',
    loadComponent: () => import('./features/patients/patient-detail/patient-detail.component').then(m => m.PatientDetailComponent),
    title: 'Patient Details | CareTransition'
  },
  {
    path: 'follow-ups',
    loadComponent: () => import('./features/follow-ups/follow-ups.component').then(m => m.FollowUpsComponent),
    title: 'Follow-Ups | CareTransition'
  },
  {
    path: 'recovery-tasks',
    loadComponent: () => import('./features/recovery-tasks/recovery-tasks.component').then(m => m.RecoveryTasksComponent),
    title: 'Recovery Tasks | CareTransition'
  },
  {
    path: 'medications',
    loadComponent: () => import('./features/medications/medications.component').then(m => m.MedicationsComponent),
    title: 'Medications | CareTransition'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
