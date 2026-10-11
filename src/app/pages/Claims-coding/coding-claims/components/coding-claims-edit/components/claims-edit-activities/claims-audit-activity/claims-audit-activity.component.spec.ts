import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsAuditActivityComponent } from './claims-audit-activity.component';

describe('ClaimsAuditActivityComponent', () => {
  let component: ClaimsAuditActivityComponent;
  let fixture: ComponentFixture<ClaimsAuditActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsAuditActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsAuditActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
