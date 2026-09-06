import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CannedResponseService } from '../../../core/services/canned-response.service';
import { CannedResponse } from '../../../core/models/canned-response';

@Component({
  selector: 'app-canned-response-management-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatTooltipModule,
  ],
  template: `
    <div class="page-header">
      <h1>Respuestas predefinidas</h1>
      <p class="page-subtitle">Plantillas que los agentes pueden insertar rápido al comentar un ticket.</p>
    </div>

    <div class="canned-grid">
      <div class="sx-card">
        <table mat-table [dataSource]="responses()">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Título</th>
            <td mat-cell *matCellDef="let r">{{ r.title }}</td>
          </ng-container>

          <ng-container matColumnDef="body">
            <th mat-header-cell *matHeaderCellDef>Contenido</th>
            <td mat-cell *matCellDef="let r" class="body-cell">{{ r.body }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let r">
              <button mat-icon-button (click)="edit(r)" matTooltip="Editar"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="delete(r)" matTooltip="Eliminar"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          @if (responses().length === 0) {
            <tr class="mat-row">
              <td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align:center;padding:2rem;">
                Aún no hay respuestas predefinidas.
              </td>
            </tr>
          }
        </table>
      </div>

      <div class="sx-card form-card">
        <h3>{{ editingId ? 'Editar respuesta' : 'Nueva respuesta' }}</h3>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
            <mat-label>Título</mat-label>
            <input matInput formControlName="title" placeholder="Ej. Solicitar más información" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
            <mat-label>Contenido</mat-label>
            <textarea matInput formControlName="body" rows="5" placeholder="Texto que se insertará en el comentario..."></textarea>
          </mat-form-field>

          <div class="form-actions">
            @if (editingId) {
              <button mat-button type="button" (click)="cancelEdit()">Cancelar</button>
            }
            <button mat-flat-button class="submit-btn" type="submit" [disabled]="form.invalid">
              {{ editingId ? 'Actualizar' : 'Agregar respuesta' }}
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

    .sx-card { background: var(--sx-card-bg); border-radius: var(--sx-radius-card); box-shadow: var(--sx-shadow-card); padding: 1.25rem; box-sizing: border-box; }
    .canned-grid { display: grid; grid-template-columns: 1fr 320px; gap: 1.25rem; align-items: start; }
    @media (max-width: 750px) { .canned-grid { grid-template-columns: 1fr; } }

    table { width: 100%; }
    .body-cell { max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .form-card h3 { margin: 0 0 1rem; font-size: 0.9375rem; font-weight: 500; color: var(--sx-text-primary); }
    .full-width { width: 100%; margin-bottom: 0.75rem; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
    .submit-btn { background: var(--sx-primary) !important; color: #fff !important; border-radius: var(--sx-radius-control); }
  `]
})
export class CannedResponseManagementPage implements OnInit {
  private fb = inject(FormBuilder);
  private cannedResponseService = inject(CannedResponseService);

  form: FormGroup;
  responses = signal<CannedResponse[]>([]);
  editingId: number | null = null;
  displayedColumns = ['title', 'body', 'actions'];

  constructor() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      body: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.cannedResponseService.getAll().subscribe((data) => this.responses.set(data));
  }

  onSubmit() {
    if (this.form.invalid) return;
    const data = this.form.value;
    if (this.editingId) {
      this.cannedResponseService.update(this.editingId, data).subscribe(() => {
        this.load();
        this.cancelEdit();
      });
    } else {
      this.cannedResponseService.create(data).subscribe(() => {
        this.load();
        this.form.reset();
      });
    }
  }

  edit(r: CannedResponse) {
    this.editingId = r.id;
    this.form.patchValue({ title: r.title, body: r.body });
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset();
  }

  delete(r: CannedResponse) {
    this.cannedResponseService.delete(r.id).subscribe(() => this.load());
  }
}
