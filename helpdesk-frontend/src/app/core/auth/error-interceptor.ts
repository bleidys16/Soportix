import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error) => {
      const msg = error.error?.detail || error.error?.message || error.statusText || 'Error inesperado';
      snackBar.open(msg, 'Cerrar', { duration: 5000, panelClass: 'error-snackbar' });
      return throwError(() => error);
    })
  );
};
