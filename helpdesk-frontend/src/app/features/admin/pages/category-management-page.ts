import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category';

@Component({
  selector: 'app-category-management-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatCardModule,
  ],
  template: `
    <h1>Categorías</h1>

    <mat-card class="form-card">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div style="display:flex;gap:1rem;align-items:flex-start">
            <mat-form-field appearance="outline" subscriptSizing="dynamic" style="flex:2">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="name" placeholder="Nombre de la categoría" />
            </mat-form-field>
            <mat-form-field appearance="outline" subscriptSizing="dynamic" style="flex:1">
              <mat-label>Color</mat-label>
              <input matInput type="color" formControlName="color" />
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              {{ editingId ? 'Actualizar' : 'Agregar' }}
            </button>
            @if (editingId) {
              <button mat-stroked-button type="button" (click)="cancelEdit()">Cancelar</button>
            }
          </div>
        </form>
      </mat-card-content>
    </mat-card>

    <mat-card>
      <mat-card-content>
        <table mat-table [dataSource]="categories()" class="mat-elevation-z1">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let c">{{ c.name }}</td>
          </ng-container>

          <ng-container matColumnDef="color">
            <th mat-header-cell *matHeaderCellDef>Color</th>
            <td mat-cell *matCellDef="let c">
              <span [style.background]="c.color" style="display:inline-block;width:24px;height:24px;border-radius:50%;border:1px solid #ccc;"></span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let c">
              <button mat-icon-button (click)="edit(c)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="delete(c)"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form-card { margin-bottom: 1rem; padding: 0.5rem; }
    table { width: 100%; }
  `]
})
export class CategoryManagementPage implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);

  form: FormGroup;
  categories = signal<Category[]>([]);
  editingId: number | null = null;
  displayedColumns = ['name', 'color', 'actions'];

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      color: ['#1976d2'],
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
        this.form.reset({ color: '#1976d2' });
      });
    }
  }

  edit(cat: Category) {
    this.editingId = cat.id;
    this.form.patchValue(cat);
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({ color: '#1976d2' });
  }

  delete(cat: Category) {
    this.categoryService.delete(cat.id).subscribe(() => this.loadCategories());
  }
}
