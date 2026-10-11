import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimvalidationresultprogressComponent } from './claimvalidationresultprogress.component';

describe('ClaimvalidationresultprogressComponent', () => {
  let component: ClaimvalidationresultprogressComponent;
  let fixture: ComponentFixture<ClaimvalidationresultprogressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimvalidationresultprogressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimvalidationresultprogressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
