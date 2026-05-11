import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checkout } from './checkout';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/AuthServices/auth-service';
import { of } from 'rxjs';

// ✅ Mocks للـ 3 services
const mockCartService = {
  getItems: () => [],
  getTotalPrice: () => 0,
  itemCountObservable$: of(0),
  clearCart: () => {}
};

const mockOrderService = {
  placeOrderCalled: false,
  placeOrder: function() {
    this.placeOrderCalled = true;
    return of({ id: 'order-123' });
  }
};

const mockAuthService = {
  getCurrentUser: () => ({
    id: '1', name: 'Test User',
    email: 'test@test.com', role: 'user'
  }),
  currentUser$: of({ id: '1', name: 'Test' })
};

describe('Checkout', () => {
  let component: Checkout;
  let fixture: ComponentFixture<Checkout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Checkout, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: CartService,  useValue: mockCartService  },
        { provide: OrderService, useValue: mockOrderService },
        { provide: AuthService,  useValue: mockAuthService  }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checkout);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init form with default paymentMethod = cash', () => {
    expect(component.checkoutForm.get('paymentMethod')?.value).toBe('cash');
  });

  it('should not place order if form is invalid', () => {
    mockOrderService.placeOrderCalled = false;
    component.placeOrder();
    expect(mockOrderService.placeOrderCalled).toBeFalsy();
  });

  it('should set loading=false after successful order', () => {
    component.checkoutForm.setValue({
      address: 'Cairo, Maadi, Street 9',
      city: 'Cairo',
      phone: '01012345678',
      paymentMethod: 'cash'
    });
    component.placeOrder();
    expect(component.loading).toBeFalsy();
  });
});