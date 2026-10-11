import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveClaimsDetailsComponent } from './archive-claims-details.component';

describe('ArchiveClaimsDetailsComponent', () => {
  let component: ArchiveClaimsDetailsComponent;
  let fixture: ComponentFixture<ArchiveClaimsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchiveClaimsDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchiveClaimsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
