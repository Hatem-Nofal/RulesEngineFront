import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingBatchesViewComponent } from './coding-batches-view.component';

describe('CodingBatchesViewComponent', () => {
  let component: CodingBatchesViewComponent;
  let fixture: ComponentFixture<CodingBatchesViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingBatchesViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingBatchesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
