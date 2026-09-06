import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `<span class="sx-logo-mark" [style.width.px]="size" [style.height.px]="size" role="img" aria-label="Soportix"></span>`,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .sx-logo-mark {
        display: inline-block;
        background: linear-gradient(180deg, var(--logo-color-top, #4d2fb2), var(--logo-color-bottom, #ff6f61));
        -webkit-mask: url('/soportix-logo.png') center / contain no-repeat;
        mask: url('/soportix-logo.png') center / contain no-repeat;
      }
    `,
  ],
})
export class LogoComponent {
  @Input() size = 40;
}
