import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class SubmitErrorStateMatcher implements ErrorStateMatcher {
  constructor(private wasSubmitted: () => boolean) {}

  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid && this.wasSubmitted());
  }
}
