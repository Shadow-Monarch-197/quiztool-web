
import { inject } from '@angular/core';
import {
  CanActivateFn,
  CanMatchFn,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

function requireLoggedIn(): boolean | UrlTree {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.parseUrl('/login');
  }
  return true;
}

export const authGuard: CanActivateFn = () => requireLoggedIn();

export const authMatchGuard: CanMatchFn = (_route, _segments) => requireLoggedIn();
