import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RiskBadgeComponent } from './risk-badge.component';

describe('RiskBadgeComponent', () => {
  let component: RiskBadgeComponent;
  let fixture: ComponentFixture<RiskBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RiskBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render HIGH risk styling and text', () => {
    component.level = 'HIGH';
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const badge = el.querySelector('.risk-badge');
    expect(badge?.classList.contains('risk-high')).toBeTrue();
    expect(el.textContent).toContain('HIGH RISK');
  });

  it('should render MEDIUM risk styling and text', () => {
    component.level = 'MEDIUM';
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const badge = el.querySelector('.risk-badge');
    expect(badge?.classList.contains('risk-medium')).toBeTrue();
    expect(el.textContent).toContain('MEDIUM RISK');
  });

  it('should render LOW risk styling and text', () => {
    component.level = 'LOW';
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const badge = el.querySelector('.risk-badge');
    expect(badge?.classList.contains('risk-low')).toBeTrue();
    expect(el.textContent).toContain('LOW RISK');
  });

  it('should apply size classes correctly', () => {
    component.size = 'lg';
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.risk-badge');
    expect(badge?.classList.contains('size-lg')).toBeTrue();
  });
});
