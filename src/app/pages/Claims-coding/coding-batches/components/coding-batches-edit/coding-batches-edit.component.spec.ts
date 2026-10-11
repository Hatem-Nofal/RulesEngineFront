import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingBatchesEditComponent } from './coding-batches-edit.component';

describe('CodingBatchesEditComponent', () => {
  let component: CodingBatchesEditComponent;
  let fixture: ComponentFixture<CodingBatchesEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingBatchesEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingBatchesEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
