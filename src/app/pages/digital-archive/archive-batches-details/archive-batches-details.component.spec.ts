import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveBatchesDetailsComponent } from './archive-batches-details.component';

describe('ArchiveBatchesDetailsComponent', () => {
  let component: ArchiveBatchesDetailsComponent;
  let fixture: ComponentFixture<ArchiveBatchesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchiveBatchesDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchiveBatchesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
