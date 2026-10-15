import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleEditComponent } from './rule-edit.component';

describe('RuleEditComponent', () => {
  let component: RuleEditComponent;
  let fixture: ComponentFixture<RuleEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RuleEditComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
