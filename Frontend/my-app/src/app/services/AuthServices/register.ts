import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IUser } from '../../models/iuser';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private apiUrl = `${environment.apiUrl}/api/Acount/Register`;

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    const registrationData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      address: user.address,
      phoneNumber: user.phoneNumber,
      city: user.city,
      role: user.role
    };
    return this.http.post<any>(this.apiUrl, registrationData);
  }
}