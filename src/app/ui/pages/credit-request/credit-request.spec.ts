import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditRequest } from './credit-request';

describe('CreditRequest', () => {
  let component: CreditRequest;
  let fixture: ComponentFixture<CreditRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
