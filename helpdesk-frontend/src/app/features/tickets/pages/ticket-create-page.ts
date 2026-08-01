import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TicketService } from '../../../core/services/ticket.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category';

@Component({
  selector: 'app-ticket-create-page',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule,
  ],
  template: `
    <div class="container">
      <a mat-button routerLink="/tickets" class="back-link"><mat-icon>arrow_back</mat-icon> Volver</a>
      <mat-card>
        <mat-card-header><mat-card-title>Nuevo Ticket</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Título</mat-label>
              <input matInput formControlName="title" placeholder="Resumen del problema" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <textarea matInput formControlName="description" rows="5" placeholder="Describa el problema en detalle"></textarea>
            </mat-form-field>

            <div class="row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Categoría</mat-label>
                <mat-select formControlName="category">
                  @for (cat of categories; track cat.id) {
                    <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Prioridad</mat-label>
                <mat-select formControlName="priority">
                  <mat-option value="low">Baja</mat-option>
                  <mat-option value="medium">Media</mat-option>
                  <mat-option value="high">Alta</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="actions">
              <button mat-stroked-button routerLink="/tickets" type="button">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Crear Ticket</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { max-width: 700px; margin: 0 auto; }
    .back-link { margin-bottom: 1rem; }
    .full-width { width: 100%; margin-bottom: 1rem; }
    .row { display: flex; gap: 1rem; }
    .half-width { flex: 1; margin-bottom: 1rem; }
    .actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem; }
  `]
})
export class TicketCreatePage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private ticketService = inject(TicketService);
  private categoryService = inject(CategoryService);

  form: FormGroup;
  categories: Category[] = [];

  constructor() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      priority: ['medium', Validators.required],
    });
  }

  ngOnInit() {
    this.categoryService.getAll().subscribe((cats) => (this.categories = cats));
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.ticketService.create(this.form.value).subscribe(() => {
      this.router.navigate(['/tickets']);
    });
  }
}
