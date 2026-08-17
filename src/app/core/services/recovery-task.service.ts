import { Injectable, signal, inject } from '@angular/core';
import { RecoveryTask } from '../models/recovery-task.model';
import { StorageService } from './storage.service';
import { getInitialRecoveryTasks } from '../data/seed-data';
import { getLocalISODate } from '../utils/date-utils';

@Injectable({
  providedIn: 'root'
})
export class RecoveryTaskService {
  private storage = inject(StorageService);

  readonly tasks = signal<RecoveryTask[]>([]);

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    if (!this.storage.isInitialized()) {
      const initial = getInitialRecoveryTasks();
      this.tasks.set(initial);
      this.saveToStorage(initial);
      return;
    }
    const saved = this.storage.getItem<RecoveryTask[]>(StorageService.KEYS.RECOVERY_TASKS, []);
    if (saved && saved.length > 0) {
      this.tasks.set(saved);
    } else {
      const initial = getInitialRecoveryTasks();
      this.tasks.set(initial);
      this.saveToStorage(initial);
    }
  }

  private saveToStorage(data: RecoveryTask[]): void {
    this.storage.setItem(StorageService.KEYS.RECOVERY_TASKS, data);
  }

  getTasks(): RecoveryTask[] {
    return this.tasks();
  }

  getTasksByPatientId(patientId: string): RecoveryTask[] {
    return this.tasks().filter(t => t.patientId === patientId);
  }

  addTask(taskData: Omit<RecoveryTask, 'id'>): RecoveryTask {
    const newTask: RecoveryTask = {
      ...taskData,
      id: 'tsk-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5)
    };

    this.tasks.update(current => {
      const updated = [newTask, ...current];
      this.saveToStorage(updated);
      return updated;
    });

    return newTask;
  }

  updateTask(id: string, updates: Partial<RecoveryTask>): RecoveryTask | undefined {
    let updatedTask: RecoveryTask | undefined;

    this.tasks.update(current => {
      const updated = current.map(t => {
        if (t.id === id) {
          updatedTask = { ...t, ...updates };
          return updatedTask;
        }
        return t;
      });
      this.saveToStorage(updated);
      return updated;
    });

    return updatedTask;
  }

  toggleTaskCompletion(id: string): RecoveryTask | undefined {
    const task = this.tasks().find(t => t.id === id);
    if (!task) return undefined;

    const newCompleted = !task.completed;
    return this.updateTask(id, {
      completed: newCompleted,
      completedDate: newCompleted ? getLocalISODate() : undefined
    });
  }

  deleteTask(id: string): boolean {
    let found = false;
    this.tasks.update(current => {
      const filtered = current.filter(t => {
        if (t.id === id) {
          found = true;
          return false;
        }
        return true;
      });
      if (found) {
        this.saveToStorage(filtered);
      }
      return filtered;
    });
    return found;
  }

  deleteByPatientId(patientId: string): void {
    this.tasks.update(current => {
      const filtered = current.filter(t => t.patientId !== patientId);
      this.saveToStorage(filtered);
      return filtered;
    });
  }

  resetToDefaults(): void {
    const initial = getInitialRecoveryTasks();
    this.tasks.set(initial);
    this.saveToStorage(initial);
  }
}
