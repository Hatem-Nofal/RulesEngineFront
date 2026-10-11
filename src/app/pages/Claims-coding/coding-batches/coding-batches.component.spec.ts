import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingBatchesComponent } from './coding-batches.component';

describe('CodingBatchesComponent', () => {
  let component: CodingBatchesComponent;
  let fixture: ComponentFixture<CodingBatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingBatchesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingBatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
