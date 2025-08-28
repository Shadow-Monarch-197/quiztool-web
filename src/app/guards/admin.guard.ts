
import { inject } from '@angular/core';
import {
  CanActivateFn,
  CanMatchFn,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

function requireAdmin(): boolean | UrlTree {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.parseUrl('/login');
  }
  if (auth.getRole() !== 'admin') {
    return router.parseUrl('/login');
  }
  return true;
}

export const adminGuard: CanActivateFn = () => requireAdmin();
export const adminMatchGuard: CanMatchFn = (_route, _segments) => requireAdmin();
