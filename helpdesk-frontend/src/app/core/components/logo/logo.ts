import { Component, Input } from '@angular/core';

let nextId = 0;

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Soportix"
    >
      <defs>
        <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#70A1A9" />
          <stop offset="0.5" stop-color="#70A1A9" />
          <stop offset="0.5" stop-color="#051D25" />
          <stop offset="1" stop-color="#051D25" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="#fff" />
      <path
        d="M13 15a5 5 0 0 1 5-5h4v6h-4a1 1 0 0 0 0 2h4a5 5 0 0 1 0 10h-4v-6h4a1 1 0 0 0 0-2h-4a5 5 0 0 1-5-5z"
        [attr.fill]="'url(#' + gradientId + ')'"
      />
    </svg>
  `,
})
export class LogoComponent {
  @Input() size = 40;
  gradientId = `logo-gradient-${nextId++}`;
}
