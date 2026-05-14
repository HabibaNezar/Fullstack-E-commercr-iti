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
import { ProductDetails } from './components/product-details/product-details';
import { Checkout } from './components/checkout/checkout';
import { ConfirmEmailComponent } from './components/confirm-email/confirm-email';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'products', component: MasterProducts },
  { path: 'products/:id', component: ProductDetails },
  { path: 'categories', component: Category },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },
  { path: 'confirm-email', component: ConfirmEmailComponent },
  { path: 'cart',     component: Cart },
  { path: 'checkout', component: Checkout },
  
  // 🔐 Protected — must be logged in
  { path: 'profile', component: UserProfile, canActivate: [AuthGuard] },
  // 🛡️ Admin only
  { path: 'users',     component: Users,     canActivate: [AuthGuard, AdminGuard] },

  // catch bad URLs
  { path: '**', redirectTo: 'home' }
];
