import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <img
      src="/soportix-logo.png"
      alt="Soportix"
      [style.width.px]="size"
      [style.height.px]="size"
      style="object-fit: contain; display: block;"
    />
  `,
})
export class LogoComponent {
  @Input() size = 40;
}
