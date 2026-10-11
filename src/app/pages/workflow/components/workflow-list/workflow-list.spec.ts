import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkFlowListComponent } from './workflow-list';

describe('WorkflowList', () => {
  let component: WorkFlowListComponent;
  let fixture: ComponentFixture<WorkFlowListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkFlowListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkFlowListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
