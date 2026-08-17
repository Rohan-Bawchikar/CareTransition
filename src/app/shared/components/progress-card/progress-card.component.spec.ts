import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressCardComponent } from './progress-card.component';

describe('ProgressCardComponent', () => {
  let component: ProgressCardComponent;
  let fixture: ComponentFixture<ProgressCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title, percentage, and subtitle', () => {
    component.title = 'Recovery Milestones';
    component.percentage = 80;
    component.subtitle = '4 of 5 tasks completed';
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Recovery Milestones');
    expect(el.textContent).toContain('80%');
    expect(el.textContent).toContain('4 of 5 tasks completed');
  });

  it('should assign color-high class when percentage >= 75', () => {
    component.percentage = 85;
    expect(component.percentageColorClass).toBe('color-high');
  });

  it('should assign color-medium class when percentage is between 40 and 74', () => {
    component.percentage = 50;
    expect(component.percentageColorClass).toBe('color-medium');
  });

  it('should assign color-low class when percentage is under 40', () => {
    component.percentage = 20;
    expect(component.percentageColorClass).toBe('color-low');
  });
});
