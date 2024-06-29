/* eslint-disable @typescript-eslint/no-unused-vars */
import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const loginGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isAuth = authService.isAuthenticated() as boolean;
  if (isAuth) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
