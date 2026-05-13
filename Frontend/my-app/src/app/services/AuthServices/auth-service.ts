import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { LoginService } from './login';
import { RegisterService } from './register';
import { LogoutService } from './logout';
import { AuthTokenService } from './auth-token.service';
import { IUser, DtoNewUser } from '../../models/iuser';
import { resolvedAuthToken } from '../../models/api-response';
import { readApiErrorMessage } from '../../utils/api-error.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private loginService = inject(LoginService);
  private registerService = inject(RegisterService);
  private logoutService = inject(LogoutService);
  private tokenService = inject(AuthTokenService);

  private currentUserSubject = new BehaviorSubject<IUser | null>(
    this._loadUserFromStorage()
  );
  currentUser$ = this.currentUserSubject.asObservable();

  private _loadUserFromStorage(): IUser | null {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      try { return JSON.parse(raw); } catch { return null; }
    }
    if (this.tokenService.getToken() && !this.tokenService.isExpired()) {
      return this._buildUserFromToken();
    }
    return null;
  }

  private _buildUserFromToken(): IUser | null {
    const payload = this.tokenService.decodePayload();
    if (!payload) return null;
    return {
      id: payload['nameid'] || payload['sub'] || null,
      firstName: payload['given_name'] || '',
      lastName: payload['family_name'] || '',
      email: payload['email'] || '',
      password: '',
      role: this.tokenService.getRole() || 'Customer',
    };
  }

  login(email: string, password: string, onError?: (msg: string) => void): void {
    this.loginService.login(email, password).subscribe({
      next: (res) => {
        const token = resolvedAuthToken(res);
        if (!token) {
          onError?.('Login failed: no token received.');
          return;
        }
        this.tokenService.setToken(token);
        const user = this._buildUserFromToken();
        if (user) {
          user.email = email;
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        this.router.navigate(['/home']);
      },
      error: (err) => {
        const msg = readApiErrorMessage(err);
        if (msg) {
          onError?.(msg);
          return;
        }
        const status = err?.status;
        if (status === 401 || status === 400) {
          onError?.('Invalid email or password. Please try again.');
        } else {
          onError?.('Login failed. Please try again.');
        }
      }
    });
  }

  register(
    user: DtoNewUser,
    onError?: () => void,
    onErrorMsg?: (msg: string) => void,
    onSuccess?: () => void
  ): void {
    this.registerService.register(user).subscribe({
      next: (res) => {
        const token = resolvedAuthToken(res);
        if (token) {
          this.tokenService.setToken(token);
          const newUser = this._buildUserFromToken();
          if (newUser) {
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            this.currentUserSubject.next(newUser);
          }
          onSuccess?.();
          this.router.navigate(['/home']);
          return;
        }
        onSuccess?.();
        this.router.navigate(['/login'], {
          queryParams: { registered: '1' },
        });
      },
      error: (err) => {
        onErrorMsg?.(AuthService.registerErrorMessage(err));
        onError?.();
      }
    });
  }

  logout(): void {
    this.logoutService.logout();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.tokenService.getToken() && !this.tokenService.isExpired();
  }

  getCurrentUser(): IUser | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(user: IUser): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  isAdmin(): boolean {
    return this.tokenService.hasRole('Admin');
  }

  isSeller(): boolean {
    return this.tokenService.hasRole('Seller') || this.tokenService.hasRole('Admin');
  }

  private static registerErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return 'Cannot reach the server. Confirm the API is running and try again.';
      }
      if (err.status === 409) {
        return 'This email is already registered. Please login instead.';
      }
      const fromBody = readApiErrorMessage(err);
      if (fromBody) return fromBody;
    }
    return 'Registration failed. Please try again.';
  }
}