import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationScreenComponent } from './application-screen.component';

describe('ApplicationScreenComponent', () => {
  let component: ApplicationScreenComponent;
  let fixture: ComponentFixture<ApplicationScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
