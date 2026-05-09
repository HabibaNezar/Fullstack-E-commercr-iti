import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login';
import { RegisterService } from './register';
import { LogoutService } from './logout';
import { IUser } from '../../models/iuser';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // 👇 broadcasts the current user to anyone listening
  private currentUserSubject = new BehaviorSubject<IUser | null>(
    this.getCurrentUser() // initialize with whatever is in localStorage
  );

  currentUser$ = this.currentUserSubject.asObservable();


  constructor(
    private loginService: LoginService,
    private registerService: RegisterService,
    private logoutService: LogoutService,
    private router: Router
  ) {}

login(email: string, password: string, onError?: (msg: string) => void): void {
  this.loginService.login(email, password).subscribe({
    next: (user) => {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      this.router.navigate(['/home']);
    },
    error: (err) => {
      // 👇 Different message based on error code
      if (err.message === 'NO_ACCOUNT') {
        onError?.('No account found with this email. Please register first.');
      } else if (err.message === 'WRONG_PASSWORD') {
        onError?.('Wrong password. Please try again.');
      } else {
        onError?.('Login failed. Please try again.');
      }
    }
  });
}
  

  register(user: IUser, onError?: () => void, onErrorMsg?: (msg: string) => void): void {
  this.registerService.register(user).subscribe({
    next: (newUser) => {
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      this.currentUserSubject.next(newUser);
      this.router.navigate(['/home']);
    },
    error: (err) => {
      // 👇 Show different message based on error code
      if (err.message === 'ACCOUNT_EXISTS') {
        onErrorMsg?.('This email is already registered. Please login instead.');
      } else {
        onErrorMsg?.('Registration failed. Please try again.');
      }
      onError?.();
    }
  });
}

  // 🚪 Logout: clear storage → go to login
  logout(): void {
    this.logoutService.logout();
    this.router.navigate(['/login']);
  }

  // ✅ Is the user logged in?
  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  // 👤 Get the current user object
  getCurrentUser(): IUser | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  // 🛡️ Is the user an admin?
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
}