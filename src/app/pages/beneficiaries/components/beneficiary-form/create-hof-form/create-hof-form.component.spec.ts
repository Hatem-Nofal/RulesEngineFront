import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHOFFormComponent } from './create-hof-form.component';

describe('CreateHOFFormComponent', () => {
  let component: CreateHOFFormComponent;
  let fixture: ComponentFixture<CreateHOFFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateHOFFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateHOFFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
