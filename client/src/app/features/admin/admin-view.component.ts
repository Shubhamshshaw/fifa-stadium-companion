import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StadiumService } from '../../core/services/stadium.service';

@Component({
  selector: 'app-admin-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <h2>🏛️ Admin Center</h2>
      <div class="card">
        <h3>Sustainability Metrics</h3>
        <div *ngIf="sustainability$ | async as s" class="metrics">
          <p *ngIf="s"><strong>Waste Reduction:</strong> {{ $any(s).wasteReductionPct }}%</p>
          <p *ngIf="s"><strong>Energy Savings:</strong> {{ $any(s).energySavingsPct }}%</p>
          <p *ngIf="s"><strong>Water Savings:</strong> {{ $any(s).waterSavingsPct }}%</p>
        </div>
      </div>
      <div class="card">
        <h3>User Role Management</h3>
        <table class="roles-table">
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
          <tr>
            <td>fan [at] example.com</td>
            <td>Fan</td>
            <td><button (click)="changeRole('fan', 'staff')">Promote</button></td>
          </tr>
          <tr>
            <td>staff [at] example.com</td>
            <td>Staff</td>
            <td><button (click)="changeRole('staff', 'admin')">Promote</button></td>
          </tr>
        </table>
      </div>
    </div>
  `,
  styles: [`.admin-container { padding: 1rem; } h2 { color: #a78bfa; } .card { background: rgba(10, 30, 60, 0.8); border: 1px solid rgba(167, 139, 250, 0.3); border-radius: 12px; padding: 1rem; margin: 1rem 0; } .metrics { background: rgba(167, 139, 250, 0.1); padding: 0.75rem; border-radius: 8px; } .roles-table { width: 100%; border-collapse: collapse; } .roles-table th, .roles-table td { padding: 0.5rem; text-align: left; border-bottom: 1px solid rgba(167, 139, 250, 0.2); } button { background: #a78bfa; color: #07152b; border: none; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-weight: 600; }`]
})
export class AdminViewComponent implements OnInit {
  sustainability$: any;
  $any = (x: any) => x;

  constructor(private stadiumService: StadiumService) {}
  ngOnInit() {
    this.sustainability$ = this.stadiumService.getSustainability('stadium-01');
  }

  changeRole(currentRole: string, newRole: string) {
    alert(`Changed user role from ${currentRole} to ${newRole}`);
  }
}
