import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingBatchesCreateComponent } from './coding-batches-create.component';

describe('CodingBatchesCreateComponent', () => {
  let component: CodingBatchesCreateComponent;
  let fixture: ComponentFixture<CodingBatchesCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingBatchesCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingBatchesCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
