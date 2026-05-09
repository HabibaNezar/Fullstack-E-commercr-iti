import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LogoutService {
  logout(): void {
    localStorage.removeItem('currentUser');  // delete saved user
  }
}