import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsEditDiagnosisComponent } from './claims-edit-diagnosis.component';

describe('ClaimsEditDiagnosisComponent', () => {
  let component: ClaimsEditDiagnosisComponent;
  let fixture: ComponentFixture<ClaimsEditDiagnosisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsEditDiagnosisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsEditDiagnosisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
