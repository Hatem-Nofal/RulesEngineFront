import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveProvidersComponent } from './archive-providers.component';

describe('ArchiveProvidersComponent', () => {
  let component: ArchiveProvidersComponent;
  let fixture: ComponentFixture<ArchiveProvidersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchiveProvidersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchiveProvidersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
