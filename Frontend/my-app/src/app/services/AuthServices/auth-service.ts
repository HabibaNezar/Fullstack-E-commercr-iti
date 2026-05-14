import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login';
import { RegisterService } from './register';
import { LogoutService } from './logout';
import { IUser } from '../../models/iuser';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private currentUserSubject = new BehaviorSubject<IUser | null>(
    this.getCurrentUser()
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
      next: (response) => {
        // Map backend response to IUser
        const user: IUser = {
          firstName: response.firstName,
          lastName: response.lastName,
          email: email, // Email isn't returned by login API, but we have it
          password: '', // Don't store password
          role: response.roles && response.roles.length > 0 ? response.roles[0] : 'Customer'
        };
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        if (err.status === 401) {
          onError?.('Invalid email or password.');
        } else if (err.error && typeof err.error === 'string') {
          onError?.(err.error);
        } else {
          onError?.('Login failed. Please try again.');
        }
      }
    });
  }

  register(user: IUser, onSuccess?: (msg: string) => void, onErrorMsg?: (msg: string) => void): void {
    this.registerService.register(user).subscribe({
      next: (response) => {
        // Backend returns a success message as a string
        onSuccess?.(typeof response === 'string' ? response : 'Registration successful! Please check your email.');
      },
      error: (err) => {
        if (err.error && typeof err.error === 'string') {
          onErrorMsg?.(err.error);
        } else if (err.error && err.error.errors) {
          // Handle ModelState errors from ASP.NET Core
          const messages = Object.values(err.error.errors).flat().join(' ');
          onErrorMsg?.(messages || 'Registration failed.');
        } else {
          onErrorMsg?.('Registration failed. Please try again.');
        }
      }
    });
  }

  logout(): void {
    this.logoutService.logout();
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): IUser | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  updateCurrentUser(user: IUser): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role?.toLowerCase() === 'admin';
  }
}