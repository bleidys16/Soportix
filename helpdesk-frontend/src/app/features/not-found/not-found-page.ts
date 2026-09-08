import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth';
import { LogoComponent } from '../../core/components/logo/logo';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, LogoComponent],
  template: `
    <div class="not-found-screen">
      <app-logo [size]="48" />
      <span class="code">404</span>
      <h1>Esta página no existe</h1>
      <p>Revisa el enlace o vuelve a un lugar conocido.</p>
      <a mat-flat-button class="home-btn" [routerLink]="homeLink">
        {{ homeLabel }}
      </a>
    </div>
  `,
  styles: [
    `
      .not-found-screen {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 2rem;
        text-align: center;
        background: #fff;
      }

      .code {
        font-family: 'Switzer', 'Geist', sans-serif;
        font-weight: 700;
        font-size: 3.5rem;
        color: var(--sx-incubi-darkness, #0e21a0);
        opacity: 0.15;
        margin-top: 0.5rem;
      }

      h1 {
        font-family: 'Switzer', 'Geist', sans-serif;
        font-size: 1.4rem;
        margin: 0.25rem 0 0;
        color: var(--sx-text-primary);
      }

      p {
        margin: 0.25rem 0 1.5rem;
        color: var(--sx-text-secondary);
        font-size: 0.9rem;
      }

      .home-btn {
        background: var(--sx-primary) !important;
        color: #fff !important;
        border-radius: 999px !important;
        height: 44px;
        padding: 0 1.5rem !important;
      }
    `,
  ],
})
export class NotFoundPage {
  private auth = inject(AuthService);

  get homeLink(): string {
    return this.auth.isAuthenticated() ? '/dashboard' : '/';
  }

  get homeLabel(): string {
    return this.auth.isAuthenticated() ? 'Ir al dashboard' : 'Ir al inicio';
  }
}
