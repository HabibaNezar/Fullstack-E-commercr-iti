import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../shared/services/user.service';
import { IUser } from '../../../models/iuser';

@Component({
  selector: 'app-seller-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-profile.html',
  styleUrl: './seller-profile.css',
})
export class SellerProfile implements OnInit {
  private authService = inject(AuthService);
  private usersService = inject(UsersService);

  loading = signal(false);
  saving = signal(false);
  saveError = signal('');
  saveSuccess = signal('');

  user = signal<IUser | null>(null);

  ngOnInit(): void {
    this.user.set(this.authService.getCurrentUser());
  }

  async saveProfile(): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) return;

    this.saving.set(true);
    this.saveError.set('');

    this.usersService
      .updateSellerProfile({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        address: currentUser.address,
        phoneNumber: currentUser.phoneNumber,
      })
      .subscribe({
        next: () => {
          this.authService.updateCurrentUser(currentUser);
          this.saving.set(false);
        },
        error: () => {
          this.saveError.set('Failed to update profile. Please try again.');
          this.saving.set(false);
        },
      });
  }

  cancel(): void {
    this.user.set(this.authService.getCurrentUser());
    this.saveError.set('');
    this.saveSuccess.set('');
  }
}
