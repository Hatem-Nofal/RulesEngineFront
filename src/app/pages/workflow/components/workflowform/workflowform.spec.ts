import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Workflowform } from './workflowform';

describe('Workflowform', () => {
  let component: Workflowform;
  let fixture: ComponentFixture<Workflowform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Workflowform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Workflowform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
