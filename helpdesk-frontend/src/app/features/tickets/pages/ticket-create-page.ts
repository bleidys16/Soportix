import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TicketService } from '../../../core/services/ticket.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/auth/auth';
import { Category } from '../../../core/models/category';
import { TicketPriority } from '../../../core/models/ticket';

@Component({
  selector: 'app-ticket-create-page',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule,
  ],
  template: `
    <div class="container">
      <a mat-button routerLink="/tickets" class="back-link"><mat-icon>arrow_back</mat-icon> Volver</a>

      <div class="page-header">
        <h1>Nuevo ticket</h1>
        <p class="page-subtitle">Describe el problema con el mayor detalle posible para acelerar la atención.</p>
      </div>

      <div class="create-grid">
        <div class="sx-card">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Título</mat-label>
              <input matInput formControlName="title" placeholder="Ej. No puedo acceder a mi correo" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Categoría</mat-label>
              <mat-select formControlName="category">
                @for (cat of categories; track cat.id) {
                  <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <label class="field-label">Prioridad</label>
            <div class="priority-toggle">
              <button type="button" class="priority-btn low" [class.active]="form.value.priority === 'low'" (click)="setPriority('low')">Baja</button>
              <button type="button" class="priority-btn medium" [class.active]="form.value.priority === 'medium'" (click)="setPriority('medium')">Media</button>
              <button type="button" class="priority-btn high" [class.active]="form.value.priority === 'high'" (click)="setPriority('high')">Alta</button>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <textarea matInput formControlName="description" rows="6" placeholder="¿Qué ocurre? ¿Desde cuándo? ¿Qué has intentado?"></textarea>
            </mat-form-field>

            <div class="actions">
              <button mat-button routerLink="/tickets" type="button">Cancelar</button>
              <button mat-flat-button class="submit-btn" type="submit" [disabled]="form.invalid">Crear ticket</button>
            </div>
          </form>
        </div>

        <div class="sx-card tips-card">
          <h3><mat-icon>info</mat-icon> Antes de enviar</h3>
          <ul class="tips-list">
            <li>Incluye el mensaje de error exacto si lo tienes.</li>
            <li>Indica si el problema afecta a más personas del equipo.</li>
            <li>Usa prioridad alta solo si bloquea tu trabajo por completo.</li>
          </ul>

          <div class="response-time">
            <span class="response-time-label">Tiempo de respuesta estimado</span>
            <div class="response-time-row" [class.active]="form.value.priority === 'high'">Alta <span>~1 hora</span></div>
            <div class="response-time-row" [class.active]="form.value.priority === 'medium'">Media <span>~4 horas</span></div>
            <div class="response-time-row" [class.active]="form.value.priority === 'low'">Baja <span>~1 día hábil</span></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 900px; margin: 0 auto; }
    .back-link { margin-bottom: 1rem; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; font-weight: 500; color: var(--sx-text-primary); }
    .page-subtitle { margin: 4px 0 0; color: var(--sx-text-secondary); font-size: 0.875rem; }

    .sx-card { background: var(--sx-card-bg); border-radius: var(--sx-radius-card); box-shadow: var(--sx-shadow-card); padding: 1.25rem; box-sizing: border-box; }
    .create-grid { display: grid; grid-template-columns: 1fr 260px; gap: 1.25rem; align-items: start; }
    @media (max-width: 700px) { .create-grid { grid-template-columns: 1fr; } }

    .full-width { width: 100%; margin-bottom: 1rem; }
    .field-label { display: block; font-size: 0.8125rem; font-weight: 500; color: var(--sx-text-secondary); margin-bottom: 0.5rem; }

    .priority-toggle { display: flex; gap: 8px; margin-bottom: 1.25rem; }
    .priority-btn { flex: 1; height: 40px; border-radius: var(--sx-radius-control); border: 1px solid var(--sx-border); background: #fff; color: var(--sx-text-secondary); font-size: 0.875rem; cursor: pointer; }
    .priority-btn.low.active { background: var(--sx-priority-low-bg); color: var(--sx-priority-low-fg); border-color: var(--sx-priority-low-fg); }
    .priority-btn.medium.active { background: var(--sx-priority-medium-bg); color: var(--sx-priority-medium-fg); border-color: var(--sx-priority-medium-fg); }
    .priority-btn.high.active { background: var(--sx-priority-high-bg); color: var(--sx-priority-high-fg); border-color: var(--sx-priority-high-fg); }

    .actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem; }
    .submit-btn { background: var(--sx-primary) !important; color: #fff !important; border-radius: var(--sx-radius-control); }

    .tips-card h3 { display: flex; align-items: center; gap: 6px; margin: 0 0 0.75rem; font-size: 0.9375rem; font-weight: 500; color: var(--sx-text-primary); }
    .tips-card h3 mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--sx-primary); }
    .tips-list { margin: 0 0 1.25rem; padding-left: 1.1rem; color: var(--sx-text-secondary); font-size: 0.8125rem; line-height: 1.6; }
    .tips-list li { margin-bottom: 0.375rem; }

    .response-time { border-top: 1px solid var(--sx-border); padding-top: 1rem; }
    .response-time-label { display: block; font-size: 0.75rem; font-weight: 500; color: var(--sx-text-muted); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 0.5rem; }
    .response-time-row { display: flex; justify-content: space-between; font-size: 0.8125rem; color: var(--sx-text-secondary); padding: 4px 6px; border-radius: 6px; }
    .response-time-row span { color: var(--sx-text-muted); }
    .response-time-row.active { background: var(--sx-page-bg); color: var(--sx-text-primary); font-weight: 500; }
    .response-time-row.active span { color: var(--sx-text-secondary); }
  `]
})
export class TicketCreatePage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private ticketService = inject(TicketService);
  private categoryService = inject(CategoryService);
  private auth = inject(AuthService);

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
    // Los administradores no pueden crear tickets; redirigir a lista
    if (this.auth.getUserRole() === 'admin') {
      this.router.navigate(['/tickets']);
      return;
    }
    this.categoryService.getAll().subscribe((cats) => (this.categories = cats));
  }

  setPriority(priority: TicketPriority) {
    this.form.patchValue({ priority });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.ticketService.create(this.form.value).subscribe(() => {
      this.router.navigate(['/tickets']);
    });
  }
}
