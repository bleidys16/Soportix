import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../core/auth/auth';
import { SubmitErrorStateMatcher } from '../../core/utils/submit-error-state-matcher';
import { LogoComponent } from '../../core/components/logo/logo';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    LogoComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  error: string | null = null;
  hidePassword = signal(true);
  submitted = false;
  matcher = new SubmitErrorStateMatcher(() => this.submitted);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      remember: [true],
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) return;

    this.error = null;
    const { username, password, remember } = this.loginForm.value;
    this.auth.login({ username, password }, remember).subscribe({
      next: () => {
        const role = this.auth.getUserRole();
        const route = role === 'admin' ? '/admin' : '/dashboard';
        this.router.navigate([route]);
      },
      error: () => {
        this.error = 'Credenciales inválidas. Intente nuevamente.';
      },
    });
  }
}
