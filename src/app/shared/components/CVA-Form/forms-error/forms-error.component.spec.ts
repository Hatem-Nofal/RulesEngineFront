import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsErrorComponent } from './forms-error.component';

describe('FormsErrorComponent', () => {
  let component: FormsErrorComponent;
  let fixture: ComponentFixture<FormsErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormsErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
