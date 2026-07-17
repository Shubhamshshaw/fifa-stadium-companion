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
        <h3>Select Stadium</h3>
        <select *ngIf="stadiums.length > 0" (change)="selectStadium($any($event.target).value)">
          <option *ngFor="let stadium of stadiums" [value]="stadium.id">{{ stadium.name }}</option>
        </select>
        <p *ngIf="stadiums.length === 0">Loading stadiums...</p>
      </div>
      <div class="card">
        <h3>Sustainability Metrics</h3>
        <div *ngIf="sustainability$ | async as s" class="metrics">
          <p><strong>Stadium:</strong> {{ selectedStadium?.name ?? 'N/A' }}</p>
          <p><strong>Waste Reduction:</strong> {{ $any(s).wasteReductionPct }}%</p>
          <p><strong>Energy Savings:</strong> {{ $any(s).energySavingsPct }}%</p>
          <p><strong>Water Savings:</strong> {{ $any(s).waterSavingsPct }}%</p>
        </div>
      </div>
      <div class="card">
        <h3>Access Management</h3>
        <p>Firebase Authentication is used for user identity. Admin access should be managed through Firebase console custom claims or role assignments.</p>
      </div>
    </div>
  `,
  styles: [`.admin-container { padding: 1rem; } h2 { color: #a78bfa; } .card { background: rgba(10, 30, 60, 0.8); border: 1px solid rgba(167, 139, 250, 0.3); border-radius: 12px; padding: 1rem; margin: 1rem 0; } .metrics { background: rgba(167, 139, 250, 0.1); padding: 0.75rem; border-radius: 8px; } select { width: 100%; padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(167, 139, 250, 0.3); background: rgba(255,255,255,0.05); color: #f5f7ff; } p { margin: 0.5rem 0; }`]
})
export class AdminViewComponent implements OnInit {
  stadiums: any[] = [];
  selectedStadium: any = null;
  sustainability$: any;
  $any = (x: any) => x;

  constructor(private stadiumService: StadiumService) {}

  ngOnInit() {
    this.stadiumService.getStadiums().subscribe((stadiums) => {
      this.stadiums = stadiums;
      if (stadiums.length > 0) {
        this.selectStadium(stadiums[0].id);
      }
    });
  }

  selectStadium(stadiumId: string) {
    const stadium = this.stadiums.find((item) => item.id === stadiumId);
    if (!stadium) {
      return;
    }

    this.selectedStadium = stadium;
    this.sustainability$ = this.stadiumService.getSustainability(stadium.id);
  }
}
