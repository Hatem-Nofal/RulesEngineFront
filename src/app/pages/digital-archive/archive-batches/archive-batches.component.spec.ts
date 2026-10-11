import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveBatchesComponent } from './archive-batches.component';

describe('ArchiveBatchesComponent', () => {
  let component: ArchiveBatchesComponent;
  let fixture: ComponentFixture<ArchiveBatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchiveBatchesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchiveBatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
