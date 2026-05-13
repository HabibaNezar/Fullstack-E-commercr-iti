import { Register } from './components/register/register';
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Products } from './components/products/products';
import { Category } from './components/category/category';
import { MasterProducts } from './components/master-product/master-product';
import { Users } from './components/users/users';
import { Cart } from './components/cart/cart';
import { AuthGuard } from './guards/auth-guard';
import { AdminGuard } from './guards/admin-guard';
import { LoginComponent } from './components/login/login';
import { UserProfile } from './components/userprofile/userprofile';
// ── Section 4 — Order Management ────────────
import { Checkout }           from './components/checkout/checkout';
import { OrderConfirmation }  from './components/order-confirmation/order-confirmation';
import { OrderTracking }      from './components/order-tracking/order-tracking';
import { MyOrders }           from './components/my-orders/my-orders';

export const routes: Routes = [
  { path: '',          component: Home },
  { path: 'home',      component: Home },
  { path: 'products',  component: MasterProducts },
  { path: 'categories',component: Category },
  { path: 'login',     component: LoginComponent },
  { path: 'register',  component: Register },

  // 🔐 Protected — must be logged in
  { path: 'cart',    component: Cart,    canActivate: [AuthGuard] },
  { path: 'profile', component: UserProfile, canActivate: [AuthGuard] },
  // 🛡️ Admin only
  { path: 'users',     component: Users,    canActivate: [AuthGuard, AdminGuard] },

  // catch bad URLs
  { path: '**', redirectTo: 'home' }
];