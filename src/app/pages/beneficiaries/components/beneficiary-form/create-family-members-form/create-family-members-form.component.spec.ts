import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFamilyMembersFormComponent } from './create-family-members-form.component';

describe('CreateFamilyMembersFormComponent', () => {
  let component: CreateFamilyMembersFormComponent;
  let fixture: ComponentFixture<CreateFamilyMembersFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateFamilyMembersFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateFamilyMembersFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
