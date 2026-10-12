import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowEditComponent } from './workflow-edit-component';

describe('WorkflowEditComponent', () => {
  let component: WorkflowEditComponent;
  let fixture: ComponentFixture<WorkflowEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowEditComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
