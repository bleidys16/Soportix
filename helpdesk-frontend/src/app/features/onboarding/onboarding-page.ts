import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth';
import { TicketService } from '../../core/services/ticket.service';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category';
import { LogoComponent } from '../../core/components/logo/logo';

@Component({
  selector: 'app-onboarding-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    LogoComponent,
  ],
  templateUrl: './onboarding-page.html',
  styleUrl: './onboarding-page.scss',
})
export class OnboardingPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private ticketService = inject(TicketService);
  private categoryService = inject(CategoryService);

  step = signal(1);
  ticketCreated = signal(false);
  creating = signal(false);
  categories: Category[] = [];

  username = this.auth.getUsername() ?? '';

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    category: ['', Validators.required],
    description: ['', Validators.required],
    priority: ['medium'],
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((cats) => (this.categories = cats));
  }

  goToStep(step: number): void {
    this.step.set(step);
  }

  createFirstTicket(): void {
    if (this.form.invalid) return;
    this.creating.set(true);
    this.ticketService.create(this.form.value).subscribe({
      next: () => {
        this.creating.set(false);
        this.ticketCreated.set(true);
        this.step.set(3);
      },
      error: () => {
        this.creating.set(false);
      },
    });
  }

  finish(): void {
    this.router.navigate(['/dashboard']);
  }
}
