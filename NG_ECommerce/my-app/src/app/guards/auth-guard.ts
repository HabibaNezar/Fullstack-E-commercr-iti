import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {AuthService} from '../services/AuthServices/auth-service'; // adjust path 

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;               // ✅ allow access
    }
    this.router.navigate(['/login']);
    return false;                // ❌ block, redirect to login
  }
}