import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { StadiumService } from '../../core/services/stadium.service';

@Component({
  selector: 'app-staff-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="staff-container">
      <h2>🚨 Staff Operations Centre</h2>

      <!-- AI Smart Dispatch Suggestion -->
      <div class="card ai-card" *ngIf="selectedStadiumId">
        <div class="ai-header">
          <h3>🤖 AI Operational Intelligence <span class="powered-by">powered by Gemini</span></h3>
          <button class="analyze-btn" (click)="analyzeAndSuggest()" [disabled]="aiAnalyzing" aria-label="Get AI dispatch recommendation">
            {{ aiAnalyzing ? '⏳ Analyzing…' : '⚡ Analyze & Suggest' }}
          </button>
        </div>
        <div *ngIf="aiSuggestion" class="ai-suggestion" aria-live="polite">
          <span class="ai-icon">🤖</span>
          <p>{{ aiSuggestion }}</p>
        </div>
        <div *ngIf="aiAnalyzing" class="ai-loading" aria-live="polite">Gemini is analyzing crowd & match data…</div>
        <p *ngIf="aiError" class="error-text" role="alert">{{ aiError }}</p>
      </div>

      <!-- Dispatch form -->
      <div class="card">
        <h3>📡 Issue Dispatch</h3>
        <form [formGroup]="dispatchForm" (ngSubmit)="onDispatch()" class="dispatch-form" aria-label="Create dispatch action">
          <label for="stadium-select">Stadium</label>
          <select id="stadium-select" formControlName="stadiumId" class="field"
                  (change)="onVenueChanged($any($event.target).value)"
                  aria-label="Select stadium">
            <option value="" disabled>Select a stadium…</option>
            <option *ngFor="let stadium of stadiums" [value]="stadium.id">{{ stadium.name }}</option>
          </select>

          <label for="action-type">Action Type</label>
          <select id="action-type" formControlName="actionType" class="field" aria-label="Action type">
            <option value="crowd-control">👥 Crowd Control</option>
            <option value="alert">⚠️ Alert</option>
            <option value="evacuation">🚨 Evacuation</option>
            <option value="medical">🏥 Medical</option>
            <option value="maintenance">🔧 Maintenance</option>
          </select>

          <label for="dispatch-desc">Description</label>
          <textarea id="dispatch-desc" formControlName="description"
                    placeholder="Describe the situation or action required…"
                    class="field" rows="3"
                    aria-label="Dispatch description"
                    [attr.aria-invalid]="dispatchForm.get('description')?.invalid && dispatchForm.get('description')?.touched">
          </textarea>
          <p *ngIf="dispatchForm.get('description')?.invalid && dispatchForm.get('description')?.touched"
             class="error-text" role="alert">Description is required (min 10 characters).</p>

          <button type="submit"
                  [disabled]="dispatchForm.invalid || dispatching || stadiums.length === 0"
                  class="submit-btn"
                  aria-label="Issue dispatch">
            {{ dispatching ? '⏳ Issuing…' : '📡 Issue Dispatch' }}
          </button>
        </form>

        <!-- Success toast -->
        <div *ngIf="successMessage" class="toast-success" role="status" aria-live="polite">
          ✅ {{ successMessage }}
        </div>
        <p *ngIf="dispatchError" class="error-text" role="alert">{{ dispatchError }}</p>
      </div>

      <!-- Dispatch history -->
      <div class="card">
        <h3>📋 Recent Dispatches</h3>
        <p *ngIf="loadingHistory" class="loading-text">Loading history…</p>
        <p *ngIf="!loadingHistory && dispatchHistory.length === 0" class="empty-text">
          No dispatches recorded for this stadium yet.
        </p>
        <div *ngFor="let d of dispatchHistory" class="dispatch-log" [class]="'log-' + d.actionType">
          <div class="log-header">
            <span class="log-type">{{ actionLabel(d.actionType) }}</span>
            <small class="log-time">{{ d.issuedAt | date: 'dd MMM, HH:mm' }}</small>
          </div>
          <p class="log-desc">{{ d.description }}</p>
          <small *ngIf="d.issuedBy" class="log-by">by {{ d.issuedBy }}</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .staff-container { padding: 1rem; }
    h2 { color: #ff7a5c; margin-bottom: 1rem; font-size: 1.4rem; }
    h3 { margin: 0 0 0.75rem; font-size: 1.05rem; color: #ffc4b4; }
    label { font-size: 0.75rem; color: #ffc4b4; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; display: block; margin-top: 0.5rem; }
    .card {
      background: rgba(10, 30, 60, 0.85);
      border: 1px solid rgba(255, 122, 92, 0.25);
      border-radius: 14px; padding: 1.25rem; margin: 0.75rem 0;
      backdrop-filter: blur(8px);
    }
    /* AI card */
    .ai-card { border-color: rgba(167, 139, 250, 0.35); }
    .ai-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
    .ai-header h3 { margin: 0; }
    .powered-by { font-size: 0.68rem; color: #a78bfa; font-weight: 400; margin-left: 6px; opacity: 0.8; }
    .analyze-btn {
      background: linear-gradient(135deg, #a78bfa, #7c3aed);
      color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 8px;
      cursor: pointer; font-weight: 700; font-size: 0.85rem; transition: opacity 0.2s;
    }
    .analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .ai-suggestion {
      display: flex; gap: 0.6rem; align-items: flex-start;
      background: rgba(167, 139, 250, 0.1); border: 1px solid rgba(167,139,250,0.3);
      border-radius: 10px; padding: 0.75rem 1rem; margin-top: 0.5rem;
    }
    .ai-icon { font-size: 1.2rem; flex-shrink: 0; }
    .ai-suggestion p { margin: 0; color: #e5d8ff; font-size: 0.9rem; line-height: 1.55; }
    .ai-loading { color: #a78bfa; font-size: 0.88rem; padding: 0.5rem 0; }
    /* Form */
    .dispatch-form { display: flex; flex-direction: column; gap: 0.3rem; }
    .field {
      background: rgba(255, 122, 92, 0.08); border: 1px solid rgba(255, 122, 92, 0.3);
      color: #f5f7ff; padding: 0.55rem 0.75rem; border-radius: 8px; font-size: 0.9rem;
      width: 100%; box-sizing: border-box;
    }
    .field:focus { outline: none; border-color: #ff7a5c; }
    textarea.field { resize: vertical; font-family: inherit; }
    .submit-btn {
      background: #ff7a5c; color: #07152b; border: none;
      padding: 0.65rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 700;
      margin-top: 0.5rem; transition: opacity 0.2s;
    }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    /* Toast */
    .toast-success {
      margin-top: 0.75rem; background: rgba(60, 220, 130, 0.15);
      border: 1px solid rgba(60, 220, 130, 0.4); color: #4dd98a;
      border-radius: 8px; padding: 0.6rem 0.9rem; font-size: 0.88rem;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    /* Dispatch log */
    .dispatch-log {
      border-radius: 10px; padding: 0.75rem 1rem; margin: 0.5rem 0;
      border-left: 3px solid #ff7a5c;
      background: rgba(255, 122, 92, 0.07);
    }
    .log-crowd-control { border-left-color: #ffd466; background: rgba(255, 212, 102, 0.07); }
    .log-alert { border-left-color: #ff9a5a; background: rgba(255, 154, 90, 0.07); }
    .log-evacuation { border-left-color: #ff5a5a; background: rgba(255, 90, 90, 0.1); }
    .log-medical { border-left-color: #4dd98a; background: rgba(77, 217, 138, 0.07); }
    .log-maintenance { border-left-color: #7ed0ff; background: rgba(126, 208, 255, 0.07); }
    .log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .log-type { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #ffc4b4; }
    .log-time { font-size: 0.75rem; color: #9ab8d8; }
    .log-desc { margin: 0 0 4px; font-size: 0.88rem; color: #e5d8ff; }
    .log-by { font-size: 0.72rem; color: #9ab8d8; }
    /* Shared */
    .loading-text, .empty-text { color: #9ab8d8; font-size: 0.85rem; }
    .error-text { color: #ff8a8a; font-size: 0.82rem; margin-top: 0.3rem; }
  `]
})
export class StaffViewComponent implements OnInit {
  stadiums: any[] = [];
  dispatchHistory: any[] = [];
  loadingHistory = false;
  dispatching = false;
  successMessage: string | null = null;
  dispatchError: string | null = null;

  // AI operational intelligence
  aiSuggestion: string | null = null;
  aiAnalyzing = false;
  aiError: string | null = null;

  get selectedStadiumId(): string { return this.dispatchForm.get('stadiumId')?.value || ''; }

  dispatchForm = this.fb.group({
    stadiumId: ['', Validators.required],
    actionType: ['alert', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor(private stadiumService: StadiumService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.stadiumService.getStadiums().subscribe({
      next: (stadiums) => {
        this.stadiums = stadiums;
        if (stadiums.length > 0) {
          const first = stadiums[0];
          this.dispatchForm.patchValue({ stadiumId: first.id });
          this.loadDispatchHistory(first.id);
        }
      },
      error: () => {}
    });
  }

  onVenueChanged(stadiumId: string): void {
    this.aiSuggestion = null;
    if (stadiumId) this.loadDispatchHistory(stadiumId);
  }

  onDispatch(): void {
    if (this.dispatchForm.invalid) {
      this.dispatchForm.markAllAsTouched();
      return;
    }
    const { stadiumId, actionType, description } = this.dispatchForm.value as any;
    this.dispatching = true;
    this.successMessage = null;
    this.dispatchError = null;

    this.stadiumService.createDispatch(stadiumId, actionType, description).subscribe({
      next: (d) => {
        this.dispatchHistory.unshift(d);
        this.dispatchForm.patchValue({ description: '' });
        this.dispatchForm.get('description')?.markAsUntouched();
        this.dispatching = false;
        this.successMessage = `Dispatch issued: "${actionType}" for ${this.stadiumName(stadiumId)}`;
        setTimeout(() => (this.successMessage = null), 4000);
      },
      error: () => {
        this.dispatching = false;
        this.dispatchError = 'Failed to issue dispatch. Please try again.';
      }
    });
  }

  analyzeAndSuggest(): void {
    const stadiumId = this.selectedStadiumId;
    const stadium = this.stadiums.find(s => s.id === stadiumId);
    if (!stadium) return;

    this.aiAnalyzing = true;
    this.aiSuggestion = null;
    this.aiError = null;

    // Fetch crowd + match data, then ask Gemini for operational recommendation
    this.stadiumService.getCrowdStatus(stadiumId).subscribe({
      next: (crowd: any) => {
        this.stadiumService.getLiveMatch(stadiumId).subscribe({
          next: (match: any) => {
            const matchInfo = match?.id !== 'none'
              ? `There is a live match: "${match.title}".`
              : 'No live match currently at this stadium.';
            const prompt = `You are an AI operations manager for a FIFA World Cup 2026 stadium. 
Stadium: ${stadium.name}, ${stadium.city} (capacity: ${stadium.capacity}).
Current crowd level: ${crowd.crowdLevel}% (status: ${crowd.status}, trend: ${crowd.trend}).
${matchInfo}
Analyze this situation and provide ONE specific operational recommendation for staff. 
Be direct, actionable, and under 3 sentences. Focus on safety and fan experience.`;

            this.stadiumService.queryAI(prompt, 'en').subscribe({
              next: (res: any) => {
                this.aiSuggestion = res.reply;
                this.aiAnalyzing = false;
              },
              error: () => {
                this.aiError = 'AI analysis unavailable. Please try again.';
                this.aiAnalyzing = false;
              }
            });
          },
          error: () => { this.aiAnalyzing = false; this.aiError = 'Could not fetch match data for analysis.'; }
        });
      },
      error: () => { this.aiAnalyzing = false; this.aiError = 'Could not fetch crowd data for analysis.'; }
    });
  }

  actionLabel(type: string): string {
    const map: Record<string, string> = {
      'crowd-control': '👥 Crowd Control',
      'alert': '⚠️ Alert',
      'evacuation': '🚨 Evacuation',
      'medical': '🏥 Medical',
      'maintenance': '🔧 Maintenance'
    };
    return map[type] ?? type;
  }

  private stadiumName(id: string): string {
    return this.stadiums.find(s => s.id === id)?.name ?? id;
  }

  private loadDispatchHistory(stadiumId: string): void {
    this.loadingHistory = true;
    this.stadiumService.getDispatches(stadiumId).subscribe({
      next: (dispatches) => { this.dispatchHistory = dispatches; this.loadingHistory = false; },
      error: () => { this.loadingHistory = false; }
    });
  }
}
