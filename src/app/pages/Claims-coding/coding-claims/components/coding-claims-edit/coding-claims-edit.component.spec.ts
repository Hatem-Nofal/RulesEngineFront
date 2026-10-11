import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingClaimsEditComponent } from './coding-claims-edit.component';

describe('CodingClaimsEditComponent', () => {
  let component: CodingClaimsEditComponent;
  let fixture: ComponentFixture<CodingClaimsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingClaimsEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingClaimsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
