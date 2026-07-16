import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { StadiumService } from '../../core/services/stadium.service';

@Component({
  selector: 'app-staff-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="staff-container">
      <h2>🚨 Staff Operations</h2>
      <div class="card">
        <h3>Dispatch Actions</h3>
        <form [formGroup]="dispatchForm" (ngSubmit)="onDispatch()" class="dispatch-form">
          <select formControlName="stadiumId" class="field">
            <option value="stadium-01">MetLife Stadium</option>
            <option value="stadium-02">SoFi Stadium</option>
          </select>
          <select formControlName="actionType" class="field">
            <option value="crowd-control">Crowd Control</option>
            <option value="alert">Alert</option>
            <option value="evacuation">Evacuation</option>
          </select>
          <textarea formControlName="description" placeholder="Description..." class="field"></textarea>
          <button type="submit">Issue Dispatch</button>
        </form>
      </div>
      <div class="card">
        <h3>Recent Dispatches</h3>
        <div *ngFor="let d of dispatches" class="dispatch-log">
          <p><strong>{{ d.actionType }}</strong> - {{ d.description }}</p>
          <small>{{ d.issuedAt | date: 'short' }}</small>
        </div>
      </div>
    </div>
  `,
  styles: [`.staff-container { padding: 1rem; } h2 { color: #ff7a5c; } .card { background: rgba(10, 30, 60, 0.8); border: 1px solid rgba(255, 122, 92, 0.3); border-radius: 12px; padding: 1rem; margin: 1rem 0; } .dispatch-form { display: flex; flex-direction: column; gap: 0.5rem; } .field { background: rgba(255, 122, 92, 0.1); border: 1px solid rgba(255, 122, 92, 0.3); color: #f5f7ff; padding: 0.5rem; border-radius: 4px; } button { background: #ff7a5c; color: #07152b; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 600; } .dispatch-log { background: rgba(255, 122, 92, 0.1); padding: 0.5rem; border-radius: 8px; margin: 0.5rem 0; }`]
})
export class StaffViewComponent implements OnInit {
  dispatchForm = this.fb.group({ stadiumId: ['stadium-01'], actionType: ['alert'], description: [''] });
  dispatches: any[] = [];

  constructor(private stadiumService: StadiumService, private fb: FormBuilder) {}
  ngOnInit() {}

  onDispatch() {
    const { stadiumId, actionType, description } = this.dispatchForm.value;
    if (stadiumId && actionType && description) {
      this.stadiumService.createDispatch(stadiumId, actionType, description).subscribe((d) => {
        this.dispatches.unshift(d);
        this.dispatchForm.reset({ stadiumId: 'stadium-01', actionType: 'alert', description: '' });
      });
    }
  }
}
