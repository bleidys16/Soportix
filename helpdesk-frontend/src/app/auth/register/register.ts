import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth';
import { SubmitErrorStateMatcher } from '../../core/utils/submit-error-state-matcher';
import { LogoComponent } from '../../core/components/logo/logo';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    LogoComponent,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerForm: FormGroup;
  error: string | null = null;
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  submitted = false;
  matcher = new SubmitErrorStateMatcher(() => this.submitted);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.registerForm.invalid) return;

    const { confirmPassword, ...data } = this.registerForm.value;

    if (data.password !== confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.error = null;
    this.auth.register(data).subscribe({
      next: () => {
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: () => {
        this.error = 'Error al registrar. Intente nuevamente.';
      },
    });
  }
}
