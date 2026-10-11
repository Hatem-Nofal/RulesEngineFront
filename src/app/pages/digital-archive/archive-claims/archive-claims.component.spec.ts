import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveClaimsComponent } from './archive-claims.component';

describe('ArchiveClaimsComponent', () => {
  let component: ArchiveClaimsComponent;
  let fixture: ComponentFixture<ArchiveClaimsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchiveClaimsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchiveClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
