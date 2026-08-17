import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render active status badge', () => {
    component.status = 'active';
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('Active');
    const badge = el.querySelector('.status-badge');
    expect(badge?.classList.contains('status-active')).toBeTrue();
  });

  it('should render overdue status badge', () => {
    component.status = 'overdue';
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('Overdue');
    const badge = el.querySelector('.status-badge');
    expect(badge?.classList.contains('status-overdue')).toBeTrue();
  });

  it('should render completed status badge', () => {
    component.status = 'completed';
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('Completed');
    const badge = el.querySelector('.status-badge');
    expect(badge?.classList.contains('status-completed')).toBeTrue();
  });
});
