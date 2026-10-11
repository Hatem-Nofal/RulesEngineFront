import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSocailResearchFormComponent } from './create-socail-research-form.component';

describe('CreateSocailResearchFormComponent', () => {
  let component: CreateSocailResearchFormComponent;
  let fixture: ComponentFixture<CreateSocailResearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSocailResearchFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSocailResearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
