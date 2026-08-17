import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render modal dialog when isOpen is false', () => {
    component.isOpen = false;
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('.modal-backdrop');
    expect(dialog).toBeNull();
  });

  it('should render modal dialog when isOpen is true', () => {
    component.isOpen = true;
    component.title = 'Confirm Removal';
    component.message = 'Are you sure you want to proceed?';
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('.modal-backdrop');
    expect(dialog).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Confirm Removal');
  });

  it('should emit confirm event when confirm button clicked', () => {
    component.isOpen = true;
    fixture.detectChanges();

    spyOn(component.confirm, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const confirmBtn = buttons[1];
    confirmBtn.click();

    expect(component.confirm.emit).toHaveBeenCalled();
  });

  it('should emit cancel event when cancel button clicked', () => {
    component.isOpen = true;
    fixture.detectChanges();

    spyOn(component.cancel, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const cancelBtn = buttons[0];
    cancelBtn.click();

    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should emit cancel event on Escape key press', () => {
    component.isOpen = true;
    fixture.detectChanges();

    spyOn(component.cancel, 'emit');
    component.onEscapePress();

    expect(component.cancel.emit).toHaveBeenCalled();
  });
});
