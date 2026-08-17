import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecoveryTaskService } from '../../core/services/recovery-task.service';
import { PatientService } from '../../core/services/patient.service';
import { ToastService } from '../../core/services/toast.service';
import { RecoveryTask, TaskCategory } from '../../core/models/recovery-task.model';
import { ProgressCardComponent } from '../../shared/components/progress-card/progress-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { getAppCurrentDate, getLocalISODate, parseLocalDate } from '../../core/utils/date-utils';

export interface EnrichedTaskItem {
  task: RecoveryTask;
  patientName: string;
  patientCondition: string;
  isOverdue: boolean;
}

@Component({
  selector: 'app-recovery-tasks',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ProgressCardComponent,
    EmptyStateComponent,
    ConfirmationDialogComponent
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Recovery Tasks & Regimens</h1>
          <p class="page-subtitle">Track patient adherence to mobility exercises, vitals monitoring, and post-discharge protocols</p>
        </div>

        <button type="button" class="btn btn-primary" (click)="openAddModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Assign Recovery Task</span>
        </button>
      </div>

      <!-- System-wide Progress Header Card -->
      <div class="progress-section">
        <app-progress-card
          title="Cohort Recovery Adherence Progress"
          [percentage]="completionPercentage()"
          [subtitle]="completedCount() + ' of ' + totalCount() + ' assigned tasks completed across all active patients'"
          [details]="(totalCount() - completedCount()) + ' tasks currently pending'"
        ></app-progress-card>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="toolbar-card">
        <!-- Category Filter Pills -->
        <div class="category-pills">
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="selectedCategory === 'ALL'"
            (click)="selectedCategory = 'ALL'"
          >
            All Categories
          </button>
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="selectedCategory === 'Physical Therapy'"
            (click)="selectedCategory = 'Physical Therapy'"
          >
            Physical Therapy
          </button>
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="selectedCategory === 'Vitals'"
            (click)="selectedCategory = 'Vitals'"
          >
            Vitals
          </button>
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="selectedCategory === 'Wound Care'"
            (click)="selectedCategory = 'Wound Care'"
          >
            Wound Care
          </button>
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="selectedCategory === 'Diet'"
            (click)="selectedCategory = 'Diet'"
          >
            Diet
          </button>
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="selectedCategory === 'General'"
            (click)="selectedCategory = 'General'"
          >
            General Care
          </button>
        </div>

        <div class="filter-controls">
          <!-- Status Dropdown -->
          <select class="filter-select" [(ngModel)]="selectedStatus">
            <option value="ALL">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="completed">Completed</option>
          </select>

          <!-- Search Input -->
          <div class="search-box">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              class="search-input" 
              placeholder="Search tasks or patients..." 
              [(ngModel)]="searchQuery"
            />
          </div>
        </div>
      </div>

      <!-- Tasks Checklist View -->
      @if (filteredTasks().length === 0) {
        <app-empty-state
          title="No recovery tasks found"
          description="There are no tasks matching your selected filters."
          icon="task"
          actionLabel="Assign Task"
          (action)="openAddModal()"
        ></app-empty-state>
      } @else {
        <div class="task-list">
          @for (item of filteredTasks(); track item.task.id) {
            <div 
              class="task-row" 
              [class.task-row-done]="item.task.completed"
              [class.task-row-overdue]="item.isOverdue"
            >
              <div class="checkbox-area">
                <input 
                  type="checkbox" 
                  [id]="'task-' + item.task.id"
                  class="custom-check" 
                  [checked]="item.task.completed"
                  (change)="toggleTaskCompletion(item.task.id)"
                />
              </div>

              <div class="task-body">
                <div class="task-top">
                  <label [for]="'task-' + item.task.id" class="task-title-text">
                    {{ item.task.title }}
                  </label>
                  <span class="cat-badge">{{ item.task.category }}</span>
                </div>

                @if (item.task.description) {
                  <p class="task-instructions">{{ item.task.description }}</p>
                }

                <div class="task-meta-bar">
                  <span class="pat-tag">
                    Patient: 
                    <a [routerLink]="['/patients', item.task.patientId]" class="pat-link">
                      <strong>{{ item.patientName }}</strong>
                    </a>
                    <span class="cond-tag">({{ item.patientCondition }})</span>
                  </span>

                  <span class="due-tag">
                    Due: <strong>{{ item.task.dueDate }}</strong>
                  </span>

                  @if (item.isOverdue) {
                    <span class="badge-overdue">Past Due</span>
                  }
                  @if (item.task.completed && item.task.completedDate) {
                    <span class="badge-done">Completed ({{ item.task.completedDate }})</span>
                  }
                </div>
              </div>

              <div class="task-actions-wrap">
                <button type="button" class="btn-icon" (click)="openEditModal(item.task)" title="Edit Task">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button type="button" class="btn-icon btn-icon-danger" (click)="confirmDelete(item.task)" title="Delete Task">
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

    <!-- Modal Form -->
    @if (isModalOpen()) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)" role="presentation">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="task-list-modal-title">
          <h3 id="task-list-modal-title" class="modal-title">{{ editingTask ? 'Edit Recovery Task' : 'Assign New Recovery Task' }}</h3>
          <form [formGroup]="taskForm" (ngSubmit)="saveTask()" class="modal-form">
            <div class="form-group">
              <label for="tskPatSelect" class="form-label">Patient *</label>
              <select 
                id="tskPatSelect"
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
              <label for="tskTitleInp" class="form-label">Task Title *</label>
              <input 
                id="tskTitleInp"
                type="text" 
                class="form-control" 
                [class.is-invalid]="isFieldInvalid('title')"
                formControlName="title" 
                placeholder="e.g. Check blood glucose twice daily, 15 min walking" 
              />
              @if (isFieldInvalid('title')) {
                <span class="error-msg">Task title is required.</span>
              }
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="tskCatSelect" class="form-label">Category *</label>
                <select id="tskCatSelect" class="form-control" formControlName="category">
                  <option value="Physical Therapy">Physical Therapy</option>
                  <option value="Vitals">Vitals</option>
                  <option value="Wound Care">Wound Care</option>
                  <option value="Diet">Diet</option>
                  <option value="Medication">Medication</option>
                  <option value="General">General Care</option>
                </select>
              </div>

              <div class="form-group">
                <label for="tskDueInp" class="form-label">Due Date *</label>
                <input 
                  id="tskDueInp"
                  type="date" 
                  class="form-control" 
                  [class.is-invalid]="isFieldInvalid('dueDate')"
                  formControlName="dueDate" 
                />
                @if (isFieldInvalid('dueDate')) {
                  <span class="error-msg">Due date is required.</span>
                }
              </div>
            </div>

            <div class="form-group">
              <label for="tskDescArea" class="form-label">Description & Adherence Instructions</label>
              <textarea id="tskDescArea" rows="2" class="form-control" formControlName="description" placeholder="Instructions, precautions, or target numbers..."></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="isModalOpen.set(false)">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="taskForm.invalid">Save Task</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    <app-confirmation-dialog
      [isOpen]="isDeleteOpen()"
      title="Delete Recovery Task"
      [message]="'Are you sure you want to delete the task: ' + (deletingTask?.title || '') + '?'"
      confirmText="Delete Task"
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

    .progress-section {
      margin-bottom: 20px;
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

    .category-pills {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .pill-btn {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #475569;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .pill-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .pill-btn.active {
      background: #0f766e;
      color: #ffffff;
      border-color: #0f766e;
    }

    .filter-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .filter-select {
      padding: 7px 10px;
      font-size: 0.84rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      color: #1e293b;
      outline: none;
    }

    .search-box {
      position: relative;
      width: 220px;
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
      padding: 7px 10px 7px 30px;
      font-size: 0.84rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      outline: none;
    }
    .search-input:focus {
      border-color: #0d9488;
    }

    /* Task List */
    .task-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .task-row {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      transition: all 0.15s ease;
    }

    .task-row:hover {
      border-color: #cbd5e1;
    }

    .task-row-overdue {
      border-left: 5px solid #e11d48;
      background: #fffbfb;
    }

    .task-row-done {
      background: #f8fafc;
      opacity: 0.8;
      .task-title-text { text-decoration: line-through; color: #64748b; }
    }

    .checkbox-area {
      margin-top: 2px;
    }

    .custom-check {
      width: 20px;
      height: 20px;
      cursor: pointer;
      accent-color: #0d9488;
    }

    .task-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .task-top {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .task-title-text {
      font-size: 0.98rem;
      font-weight: 700;
      color: #0f172a;
      cursor: pointer;
    }

    .cat-badge {
      font-size: 0.72rem;
      font-weight: 600;
      background: #f0fdfa;
      color: #0f766e;
      border: 1px solid #ccfbf1;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .task-instructions {
      font-size: 0.82rem;
      color: #475569;
      margin: 2px 0 6px;
      line-height: 1.4;
    }

    .task-meta-bar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 0.78rem;
      color: #64748b;
    }

    .pat-link {
      color: #0f766e;
      text-decoration: none;
    }
    .pat-link:hover {
      text-decoration: underline;
    }

    .cond-tag {
      color: #64748b;
      margin-left: 3px;
    }

    .badge-overdue {
      background: #ffe4e6;
      color: #e11d48;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 700;
    }

    .badge-done {
      background: #dcfce7;
      color: #15803d;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 600;
    }

    .task-actions-wrap {
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
      .filter-controls {
        flex-direction: column;
        align-items: stretch;
      }
      .search-box {
        width: 100%;
      }
    }
  `]
})
export class RecoveryTasksComponent {
  taskService = inject(RecoveryTaskService);
  patientService = inject(PatientService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  selectedCategory: 'ALL' | TaskCategory = 'ALL';
  selectedStatus: 'ALL' | 'pending' | 'overdue' | 'completed' = 'ALL';
  searchQuery = '';

  isModalOpen = signal(false);
  isDeleteOpen = signal(false);
  editingTask?: RecoveryTask;
  deletingTask?: RecoveryTask;
  taskForm!: FormGroup;

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    const todayStr = getLocalISODate();
    this.taskForm = this.fb.group({
      patientId: ['', Validators.required],
      title: ['', Validators.required],
      category: ['Physical Therapy', Validators.required],
      dueDate: [todayStr, Validators.required],
      description: ['']
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const ctrl = this.taskForm.get(fieldName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  readonly totalCount = computed(() => this.taskService.tasks().length);
  readonly completedCount = computed(() => this.taskService.tasks().filter(t => t.completed).length);
  readonly completionPercentage = computed(() => {
    const total = this.totalCount();
    if (total === 0) return 100;
    return Math.round((this.completedCount() / total) * 100);
  });

  readonly enrichedTasks = computed<EnrichedTaskItem[]>(() => {
    const list = this.taskService.tasks();
    const patients = this.patientService.patients();
    const today = getAppCurrentDate();
    today.setHours(0, 0, 0, 0);

    return list.map(task => {
      const p = patients.find(pat => pat.id === task.patientId);
      const isPast = parseLocalDate(task.dueDate).getTime() < today.getTime();
      return {
        task,
        patientName: p ? p.fullName : 'Unknown Patient',
        patientCondition: p ? p.primaryCondition : 'General Care',
        isOverdue: !task.completed && isPast
      };
    });
  });

  readonly filteredTasks = computed(() => {
    let items = this.enrichedTasks();

    // Category Filter
    if (this.selectedCategory !== 'ALL') {
      items = items.filter(item => item.task.category === this.selectedCategory);
    }

    // Status Filter
    if (this.selectedStatus === 'completed') {
      items = items.filter(item => item.task.completed);
    } else if (this.selectedStatus === 'overdue') {
      items = items.filter(item => item.isOverdue);
    } else if (this.selectedStatus === 'pending') {
      items = items.filter(item => !item.task.completed && !item.isOverdue);
    }

    // Search Filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      items = items.filter(item => {
        return (
          item.task.title.toLowerCase().includes(q) ||
          item.patientName.toLowerCase().includes(q) ||
          (item.task.description && item.task.description.toLowerCase().includes(q))
        );
      });
    }

    // Sort: Overdue first, then pending by due date asc, then completed
    return [...items].sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      if (a.task.completed && !b.task.completed) return 1;
      if (!a.task.completed && b.task.completed) return -1;
      return parseLocalDate(a.task.dueDate).getTime() - parseLocalDate(b.task.dueDate).getTime();
    });
  });

  toggleTaskCompletion(id: string): void {
    const updated = this.taskService.toggleTaskCompletion(id);
    if (updated) {
      if (updated.completed) {
        this.toastService.success('Task Completed', `"${updated.title}" marked as finished.`);
      } else {
        this.toastService.info('Task Reopened', `"${updated.title}" marked as pending.`);
      }
    }
  }

  openAddModal(): void {
    this.editingTask = undefined;
    const firstPat = this.patientService.patients()[0];
    const todayStr = getLocalISODate();

    this.taskForm.reset({
      patientId: firstPat ? firstPat.id : '',
      title: '',
      category: 'Physical Therapy',
      dueDate: todayStr,
      description: ''
    });
    this.isModalOpen.set(true);
  }

  openEditModal(t: RecoveryTask): void {
    this.editingTask = t;
    this.taskForm.patchValue({
      patientId: t.patientId,
      title: t.title,
      category: t.category,
      dueDate: t.dueDate,
      description: t.description || ''
    });
    this.isModalOpen.set(true);
  }

  saveTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    const formVal = this.taskForm.value;

    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask.id, formVal);
      this.toastService.success('Task Updated', `"${formVal.title}" updated.`);
    } else {
      this.taskService.addTask({
        ...formVal,
        completed: false
      });
      this.toastService.success('Task Assigned', `"${formVal.title}" assigned.`);
    }
    this.isModalOpen.set(false);
  }

  confirmDelete(t: RecoveryTask): void {
    this.deletingTask = t;
    this.isDeleteOpen.set(true);
  }

  executeDelete(): void {
    if (!this.deletingTask) return;
    this.taskService.deleteTask(this.deletingTask.id);
    this.toastService.info('Task Removed', 'Recovery task removed.');
    this.isDeleteOpen.set(false);
    this.deletingTask = undefined;
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
