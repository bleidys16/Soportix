import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'];
  const expectedRoles: string[] | undefined = route.data['roles'];
  const userRole = auth.getUserRole();

  const allowed =
    auth.isAuthenticated() &&
    (expectedRoles ? expectedRoles.includes(userRole ?? '') : userRole === expectedRole);

  if (allowed) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};