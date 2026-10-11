import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingClaimsComponent } from './coding-claims.component';

describe('CodingClaimsComponent', () => {
  let component: CodingClaimsComponent;
  let fixture: ComponentFixture<CodingClaimsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingClaimsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
