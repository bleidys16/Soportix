import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <span class="sx-logo-mark" [style.width.px]="size" [style.height.px]="size" role="img" aria-label="Soportix">
      <span class="arm arm-1"></span>
      <span class="arm arm-2"></span>
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .sx-logo-mark {
        position: relative;
        display: inline-block;
      }

      .arm {
        position: absolute;
        inset: 0;
      }

      .arm-1 {
        background: var(--logo-color-top, #4d2fb2);
        -webkit-mask: url('/soportix-logo-arm-1.png') center / contain no-repeat;
        mask: url('/soportix-logo-arm-1.png') center / contain no-repeat;
      }

      .arm-2 {
        background: var(--logo-color-bottom, #ff6f61);
        -webkit-mask: url('/soportix-logo-arm-2.png') center / contain no-repeat;
        mask: url('/soportix-logo-arm-2.png') center / contain no-repeat;
      }
    `,
  ],
})
export class LogoComponent {
  @Input() size = 40;
}
