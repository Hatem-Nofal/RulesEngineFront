import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchvlaidaionComponent } from './batchvlaidaion.component';

describe('BatchvlaidaionComponent', () => {
  let component: BatchvlaidaionComponent;
  let fixture: ComponentFixture<BatchvlaidaionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchvlaidaionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatchvlaidaionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
