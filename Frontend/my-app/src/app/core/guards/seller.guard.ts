import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const sellerGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
        return false;
    }

    if (auth.isSeller()) return true;

    router.navigate(['/home']);
    return false;
};

/** PascalCase alias for backward compatibility. */
export const SellerGuard = sellerGuard;