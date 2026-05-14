import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="confirm-container">
      <div class="card">
        <div *ngIf="status === 'loading'" class="loading">
          <div class="spinner"></div>
          <p>Verifying your email...</p>
        </div>

        <div *ngIf="status === 'success'" class="success">
          <div class="icon">✅</div>
          <h2>Email Confirmed!</h2>
          <p>{{ message }}</p>
          <a routerLink="/login" class="btn">Go to Login</a>
        </div>

        <div *ngIf="status === 'error'" class="error">
          <div class="icon">❌</div>
          <h2>Confirmation Failed</h2>
          <p>{{ message }}</p>
          <a routerLink="/register" class="btn">Try Registering Again</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      background: #f4f7f6;
    }
    .card {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      text-align: center;
      max-width: 450px;
      width: 90%;
    }
    .icon { font-size: 4rem; margin-bottom: 1rem; }
    h2 { margin-bottom: 1rem; color: #2d3436; }
    p { color: #636e72; margin-bottom: 2rem; line-height: 1.6; }
    .btn {
      display: inline-block;
      background: #0984e3;
      color: white;
      padding: 0.8rem 2rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      transition: background 0.2s;
    }
    .btn:hover { background: #0773c5; }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #0984e3;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1.5rem;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class ConfirmEmailComponent implements OnInit {
  status: 'loading' | 'success' | 'error' = 'loading';
  message = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const userId = params['userId'];
      const token = params['token'];

      if (!userId || !token) {
        this.status = 'error';
        this.message = 'Invalid confirmation link. Missing user ID or token.';
        return;
      }

      this.confirmEmail(userId, token);
    });
  }

  confirmEmail(userId: string, token: string) {
    const url = `${environment.apiUrl}/api/Acount/ConfirmEmail?userId=${userId}&token=${encodeURIComponent(token)}`;
    
    this.http.get(url, { responseType: 'text' }).subscribe({
      next: (res) => {
        this.status = 'success';
        this.message = res || 'Your email has been successfully confirmed.';
      },
      error: (err) => {
        this.status = 'error';
        this.message = err.error || 'The confirmation link is invalid or has expired.';
      }
    });
  }
}
