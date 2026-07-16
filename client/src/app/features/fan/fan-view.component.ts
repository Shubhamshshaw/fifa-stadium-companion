import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { StadiumService } from '../../core/services/stadium.service';

@Component({
  selector: 'app-fan-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fan-container">
      <h2>⚽ Fan Companion</h2>
      <div class="card">
        <h3>Select Your Stadium</h3>
        <div class="stadium-grid">
          <button *ngFor="let s of stadiums$ | async" (click)="selectStadium(s)"
                  [class.selected]="selectedStadium?.id === s.id" class="stadium-btn">
            <strong>{{ s.name }}</strong><small>{{ s.city }}</small>
          </button>
        </div>
      </div>
      <div *ngIf="selectedStadium" class="card">
        <h3>{{ selectedStadium.name }}</h3>
        <p><strong>Capacity:</strong> {{ selectedStadium.capacity | number }}</p>
        <div *ngIf="crowdStatus$ | async as c" class="crowd-info">
          <p *ngIf="c"><strong>Crowd:</strong> {{ $any(c).crowdLevel }}% - {{ $any(c).status }}</p>
        </div>
      </div>
      <div *ngIf="selectedStadium" class="card">
        <h3>AI Assistant</h3>
        <form [formGroup]="aiForm" (ngSubmit)="onAIQuery()" class="ai-form">
          <input formControlName="query" placeholder="Ask..." />
          <select formControlName="language">
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
          <button type="submit">Send</button>
        </form>
        <div *ngIf="aiResponse" class="ai-response">
          <p><strong>AI:</strong> {{ aiResponse }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`.fan-container { padding: 1rem; } h2 { color: #7ed0ff; } .card { background: rgba(10, 30, 60, 0.8); border: 1px solid rgba(126, 208, 255, 0.3); border-radius: 12px; padding: 1rem; margin: 1rem 0; } .stadium-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem; } .stadium-btn { background: rgba(126, 208, 255, 0.1); border: 1px solid rgba(126, 208, 255, 0.3); color: #f5f7ff; padding: 0.5rem; border-radius: 8px; cursor: pointer; } .stadium-btn.selected { background: rgba(126, 208, 255, 0.5); } .ai-form { display: flex; gap: 0.5rem; } .ai-form input, .ai-form select { background: rgba(126, 208, 255, 0.1); border: 1px solid rgba(126, 208, 255, 0.3); color: #f5f7ff; padding: 0.5rem; border-radius: 4px; flex: 1; } .ai-form button { background: #7ed0ff; color: #07152b; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 600; }`]
})
export class FanViewComponent implements OnInit {
  stadiums$ = this.stadiumService.getStadiums();
  crowdStatus$: any;
  selectedStadium: any;
  aiResponse: string | null = null;
  aiForm = this.fb.group({ query: [''], language: ['en'] });
  $any = (x: any) => x;

  constructor(private stadiumService: StadiumService, private fb: FormBuilder) {}
  ngOnInit() {}

  selectStadium(stadium: any) {
    this.selectedStadium = stadium;
    this.crowdStatus$ = this.stadiumService.getCrowdStatus(stadium.id);
  }

  onAIQuery() {
    const query = this.aiForm.get('query')?.value || '';
    const language = this.aiForm.get('language')?.value || 'en';
    if (query) {
      this.stadiumService.queryAI(query, language).subscribe((res) => {
        this.aiResponse = res.reply;
        this.aiForm.reset({ query: '', language });
      });
    }
  }
}
