import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category';

@Component({
  selector: 'app-category-management-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatTooltipModule,
  ],
  template: `
    <div class="page-header">
      <h1>Categorías</h1>
      <p class="page-subtitle">Define cómo se clasifican las incidencias reportadas.</p>
    </div>

    @if (deleteError) {
      <p class="error-banner">{{ deleteError }}</p>
    }

    <div class="category-grid">
      <div class="sx-card">
        <table mat-table [dataSource]="categories()">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Categoría</th>
            <td mat-cell *matCellDef="let c">
              <div class="name-cell">
                <span class="color-dot" [style.background]="c.color"></span>
                {{ c.name }}
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Descripción</th>
            <td mat-cell *matCellDef="let c">{{ c.description || '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="ticket_count">
            <th mat-header-cell *matHeaderCellDef>Tickets</th>
            <td mat-cell *matCellDef="let c">{{ c.ticket_count }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let c">
              <button mat-icon-button (click)="edit(c)" matTooltip="Editar"><mat-icon>edit</mat-icon></button>
              <button
                mat-icon-button
                color="warn"
                [disabled]="c.ticket_count > 0"
                [matTooltip]="c.ticket_count > 0 ? 'No se puede eliminar: tiene tickets asociados' : 'Eliminar'"
                (click)="delete(c)"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>

      <div class="sx-card form-card">
        <h3>{{ editingId ? 'Editar categoría' : 'Nueva categoría' }}</h3>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="name" placeholder="Ej. Telefonía" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
            <mat-label>Descripción</mat-label>
            <textarea matInput formControlName="description" rows="2" placeholder="¿Qué tipo de incidencias agrupa?"></textarea>
          </mat-form-field>

          <label class="field-label">Color</label>
          <input type="color" formControlName="color" class="color-input" />

          <div class="form-actions">
            @if (editingId) {
              <button mat-button type="button" (click)="cancelEdit()">Cancelar</button>
            }
            <button mat-flat-button class="submit-btn" type="submit" [disabled]="form.invalid">
              {{ editingId ? 'Actualizar' : 'Agregar categoría' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; font-weight: 500; color: var(--sx-text-primary); }
    .page-subtitle { margin: 4px 0 0; color: var(--sx-text-secondary); font-size: 0.875rem; }

    .error-banner { background: var(--sx-priority-high-bg); color: var(--sx-priority-high-fg); padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.875rem; }

    .sx-card { background: var(--sx-card-bg); border-radius: var(--sx-radius-card); box-shadow: var(--sx-shadow-card); padding: 1.25rem; box-sizing: border-box; }
    .category-grid { display: grid; grid-template-columns: 1fr 300px; gap: 1.25rem; align-items: start; }
    @media (max-width: 750px) { .category-grid { grid-template-columns: 1fr; } }

    table { width: 100%; }
    .name-cell { display: flex; align-items: center; gap: 8px; }
    .color-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }

    .form-card h3 { margin: 0 0 1rem; font-size: 0.9375rem; font-weight: 500; color: var(--sx-text-primary); }
    .full-width { width: 100%; margin-bottom: 0.75rem; }
    .field-label { display: block; font-size: 0.8125rem; font-weight: 500; color: var(--sx-text-secondary); margin-bottom: 0.5rem; }
    .color-input { width: 100%; height: 36px; border: 1px solid var(--sx-border); border-radius: var(--sx-radius-control); padding: 2px; box-sizing: border-box; margin-bottom: 1rem; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
    .submit-btn { background: var(--sx-primary) !important; color: #fff !important; border-radius: var(--sx-radius-control); }
  `]
})
export class CategoryManagementPage implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);

  form: FormGroup;
  categories = signal<Category[]>([]);
  editingId: number | null = null;
  displayedColumns = ['name', 'description', 'ticket_count', 'actions'];
  deleteError: string | null = null;

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      color: ['#0d454e'],
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getAll().subscribe((data) => this.categories.set(data));
  }

  onSubmit() {
    if (this.form.invalid) return;
    const data = this.form.value;
    if (this.editingId) {
      this.categoryService.update(this.editingId, data).subscribe(() => {
        this.loadCategories();
        this.cancelEdit();
      });
    } else {
      this.categoryService.create(data).subscribe(() => {
        this.loadCategories();
        this.form.reset({ color: '#0d454e' });
      });
    }
  }

  edit(cat: Category) {
    this.editingId = cat.id;
    this.deleteError = null;
    this.form.patchValue(cat);
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({ color: '#0d454e' });
  }

  delete(cat: Category) {
    if (cat.ticket_count > 0) return;
    this.deleteError = null;
    this.categoryService.delete(cat.id).subscribe({
      next: () => this.loadCategories(),
      error: (err) => {
        this.deleteError = err?.error?.detail || 'No se pudo eliminar la categoría.';
      },
    });
  }
}
