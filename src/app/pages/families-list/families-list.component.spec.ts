import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamiliesListComponent } from './families-list.component';

describe('FamiliesListComponent', () => {
  let component: FamiliesListComponent;
  let fixture: ComponentFixture<FamiliesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamiliesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FamiliesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
