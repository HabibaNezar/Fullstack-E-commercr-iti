import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerEarnings } from './seller-earnings';

describe('SellerEarnings', () => {
  let component: SellerEarnings;
  let fixture: ComponentFixture<SellerEarnings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerEarnings]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SellerEarnings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
