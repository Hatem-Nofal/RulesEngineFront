import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsEditClaimComponent } from './claims-edit-claim.component';

describe('ClaimsEditClaimComponent', () => {
  let component: ClaimsEditClaimComponent;
  let fixture: ComponentFixture<ClaimsEditClaimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsEditClaimComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsEditClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
