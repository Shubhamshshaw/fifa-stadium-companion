import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { StadiumService } from '../../core/services/stadium.service';

@Component({
  selector: 'app-fan-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fan-container">
      <h2>⚽ Fan Companion</h2>

      <!-- Stadium selector -->
      <div class="card">
        <h3>Select Your Stadium</h3>
        <p *ngIf="loadingStadiums" class="loading-text" aria-live="polite">Loading stadiums…</p>
        <p *ngIf="stadiumsError" class="error-text" role="alert">{{ stadiumsError }}</p>
        <div class="stadium-grid" role="list">
          <button
            *ngFor="let s of stadiums"
            (click)="selectStadium(s)"
            [class.selected]="selectedStadium?.id === s.id"
            class="stadium-btn"
            role="listitem"
            [attr.aria-pressed]="selectedStadium?.id === s.id"
            [attr.aria-label]="s.name + ', ' + s.city + ', capacity ' + s.capacity">
            <span class="stadium-icon">🏟️</span>
            <strong>{{ s.name }}</strong>
            <small>{{ s.city }}</small>
            <small class="cap">Cap: {{ s.capacity | number }}</small>
          </button>
        </div>
      </div>

      <!-- Stadium detail -->
      <div *ngIf="selectedStadium" class="card stadium-detail" aria-live="polite">
        <h3>{{ selectedStadium.name }}</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">📍 City</span>
            <span>{{ selectedStadium.city }}</span>
          </div>
          <div class="detail-item">
            <span class="label">🏟️ Capacity</span>
            <span>{{ selectedStadium.capacity | number }}</span>
          </div>

          <!-- Crowd level -->
          <ng-container *ngIf="crowdData">
            <div class="detail-item">
              <span class="label">👥 Crowd Level</span>
              <span [class]="'crowd-badge crowd-' + crowdData.status">
                {{ crowdData.crowdLevel }}% · {{ crowdData.status | titlecase }}
              </span>
            </div>
            <div class="detail-item full-width">
              <div class="crowd-bar-bg" role="progressbar"
                   [attr.aria-valuenow]="crowdData.crowdLevel"
                   aria-valuemin="0" aria-valuemax="100">
                <div class="crowd-bar" [style.width.%]="crowdData.crowdLevel"
                     [class]="'crowd-fill-' + crowdData.status"></div>
              </div>
            </div>
          </ng-container>
          <p *ngIf="loadingCrowd" class="loading-text">Loading crowd data…</p>

          <!-- Live match -->
          <div *ngIf="liveMatch" class="detail-item full-width">
            <span class="label">🎮 Match at this venue</span>
            <span class="live-badge" *ngIf="liveMatch.stadiumId === selectedStadium.id">● LIVE</span>
            <span class="match-title">{{ liveMatch.title }}</span>
          </div>
        </div>
      </div>

      <!-- AI Assistant -->
      <div *ngIf="selectedStadium" class="card">
        <h3>🤖 AI Stadium Assistant <span class="powered-by">powered by Gemini</span></h3>
        <form [formGroup]="aiForm" (ngSubmit)="onAIQuery()" class="ai-form" aria-label="Ask the AI assistant">
          <input
            id="ai-query-input"
            formControlName="query"
            placeholder="Ask about food, exits, parking, transport…"
            aria-label="Your question"
            [attr.aria-invalid]="aiForm.get('query')?.invalid && aiForm.get('query')?.touched" />
          <select formControlName="language" aria-label="Response language">
            <option value="en">🇬🇧 EN</option>
            <option value="es">🇪🇸 ES</option>
            <option value="fr">🇫🇷 FR</option>
          </select>
          <button type="submit" [disabled]="aiLoading || aiForm.invalid" aria-label="Send question">
            {{ aiLoading ? '…' : 'Ask' }}
          </button>
        </form>
        <p *ngIf="aiForm.get('query')?.invalid && aiForm.get('query')?.touched"
           class="error-text" role="alert">Please enter a question.</p>

        <!-- AI response -->
        <div *ngIf="aiLoading" class="ai-loading" aria-live="polite">
          <span class="dot-flashing"></span> Gemini is thinking…
        </div>
        <div *ngIf="aiResponse && !aiLoading" class="ai-response" aria-live="polite">
          <div class="ai-bubble">
            <span class="ai-icon">🤖</span>
            <p>{{ aiResponse }}</p>
          </div>
        </div>
        <p *ngIf="aiError" class="error-text" role="alert">{{ aiError }}</p>
      </div>
    </div>
  `,
  styles: [`
    .fan-container { padding: 1rem; }
    h2 { color: #7ed0ff; margin-bottom: 1rem; font-size: 1.4rem; }
    h3 { margin: 0 0 0.75rem; font-size: 1.05rem; color: #c8e8ff; }
    .card {
      background: rgba(10, 30, 60, 0.85);
      border: 1px solid rgba(126, 208, 255, 0.25);
      border-radius: 14px; padding: 1.25rem; margin: 0.75rem 0;
      backdrop-filter: blur(8px);
    }
    /* Stadium grid */
    .stadium-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.6rem; }
    .stadium-btn {
      display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
      background: rgba(126, 208, 255, 0.07); border: 1px solid rgba(126, 208, 255, 0.22);
      color: #f5f7ff; padding: 0.6rem 0.75rem; border-radius: 10px;
      cursor: pointer; text-align: left; transition: all 0.2s ease;
    }
    .stadium-btn:hover { background: rgba(126, 208, 255, 0.18); border-color: rgba(126, 208, 255, 0.5); }
    .stadium-btn.selected { background: rgba(126, 208, 255, 0.3); border-color: #7ed0ff; box-shadow: 0 0 0 2px rgba(126,208,255,0.3); }
    .stadium-btn strong { font-size: 0.85rem; line-height: 1.2; }
    .stadium-btn small { font-size: 0.72rem; color: #9ab8d8; }
    .stadium-btn .cap { color: #7ed0ff; }
    .stadium-icon { font-size: 1.1rem; }
    /* Detail */
    .stadium-detail h3 { font-size: 1.2rem; color: #7ed0ff; margin-bottom: 1rem; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
    .detail-item { display: flex; flex-direction: column; gap: 2px; }
    .detail-item.full-width { grid-column: 1 / -1; }
    .label { font-size: 0.72rem; color: #9ab8d8; text-transform: uppercase; letter-spacing: 0.05em; }
    /* Crowd */
    .crowd-badge { font-size: 0.82rem; font-weight: 600; padding: 2px 8px; border-radius: 999px; display: inline-block; }
    .crowd-busy { background: rgba(255,90,90,0.2); color: #ff7a7a; border: 1px solid rgba(255,90,90,0.4); }
    .crowd-steady { background: rgba(255,200,50,0.2); color: #ffd466; border: 1px solid rgba(255,200,50,0.4); }
    .crowd-calm { background: rgba(60,220,130,0.2); color: #4dd98a; border: 1px solid rgba(60,220,130,0.4); }
    .crowd-bar-bg { background: rgba(126,208,255,0.1); border-radius: 99px; height: 8px; overflow: hidden; }
    .crowd-bar { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
    .crowd-fill-busy { background: linear-gradient(90deg, #ff5a5a, #ff9a5a); }
    .crowd-fill-steady { background: linear-gradient(90deg, #ffd466, #ffaa00); }
    .crowd-fill-calm { background: linear-gradient(90deg, #4dd98a, #00c6ff); }
    /* Live match */
    .live-badge { background: #ff4444; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 2px 7px; border-radius: 999px; margin-right: 6px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
    .match-title { font-size: 0.9rem; font-weight: 600; }
    /* AI */
    .powered-by { font-size: 0.68rem; color: #7ed0ff; font-weight: 400; margin-left: 6px; opacity: 0.7; }
    .ai-form { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
    .ai-form input {
      flex: 1; min-width: 180px;
      background: rgba(126, 208, 255, 0.08); border: 1px solid rgba(126, 208, 255, 0.3);
      color: #f5f7ff; padding: 0.55rem 0.75rem; border-radius: 8px; font-size: 0.9rem;
    }
    .ai-form input:focus { outline: none; border-color: #7ed0ff; }
    .ai-form select {
      background: rgba(126, 208, 255, 0.08); border: 1px solid rgba(126, 208, 255, 0.3);
      color: #f5f7ff; padding: 0.55rem 0.5rem; border-radius: 8px;
    }
    .ai-form button {
      background: #7ed0ff; color: #07152b; border: none;
      padding: 0.55rem 1.1rem; border-radius: 8px; cursor: pointer; font-weight: 700;
      transition: opacity 0.2s;
    }
    .ai-form button:disabled { opacity: 0.5; cursor: not-allowed; }
    .ai-loading { color: #9ab8d8; font-size: 0.88rem; padding: 0.5rem 0; }
    .ai-response { margin-top: 0.75rem; }
    .ai-bubble { display: flex; gap: 0.6rem; align-items: flex-start; background: rgba(126,208,255,0.07); border-radius: 10px; padding: 0.75rem 1rem; }
    .ai-icon { font-size: 1.2rem; flex-shrink: 0; }
    .ai-bubble p { margin: 0; line-height: 1.55; font-size: 0.9rem; color: #dbe5ff; }
    /* Shared */
    .loading-text { color: #9ab8d8; font-size: 0.85rem; }
    .error-text { color: #ff8a8a; font-size: 0.85rem; margin-top: 0.3rem; }
  `]
})
export class FanViewComponent implements OnInit {
  stadiums: any[] = [];
  loadingStadiums = true;
  stadiumsError: string | null = null;

  selectedStadium: any = null;
  crowdData: any = null;
  loadingCrowd = false;
  liveMatch: any = null;

  aiLoading = false;
  aiResponse: string | null = null;
  aiError: string | null = null;

  aiForm = this.fb.group({
    query: ['', [Validators.required, Validators.minLength(3)]],
    language: ['en']
  });

  constructor(private stadiumService: StadiumService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.stadiumService.getStadiums().subscribe({
      next: (stadiums) => {
        this.stadiums = stadiums;
        this.loadingStadiums = false;
      },
      error: () => {
        this.loadingStadiums = false;
        this.stadiumsError = 'Failed to load stadiums. Please check your connection.';
      }
    });
  }

  selectStadium(stadium: any): void {
    this.selectedStadium = stadium;
    this.crowdData = null;
    this.liveMatch = null;
    this.aiResponse = null;
    this.aiError = null;
    this.loadingCrowd = true;

    this.stadiumService.getCrowdStatus(stadium.id).subscribe({
      next: (data) => { this.crowdData = data; this.loadingCrowd = false; },
      error: () => { this.loadingCrowd = false; }
    });

    this.stadiumService.getLiveMatch(stadium.id).subscribe({
      next: (match) => { this.liveMatch = match?.id !== 'none' ? match : null; },
      error: () => {}
    });
  }

  onAIQuery(): void {
    if (this.aiForm.invalid || !this.selectedStadium) return;
    const query = this.aiForm.get('query')!.value as string;
    const language = this.aiForm.get('language')!.value as string;
    const enrichedQuery = `${query} (Stadium: ${this.selectedStadium.name}, City: ${this.selectedStadium.city}, Capacity: ${this.selectedStadium.capacity})`;

    this.aiLoading = true;
    this.aiResponse = null;
    this.aiError = null;

    this.stadiumService.queryAI(enrichedQuery, language).subscribe({
      next: (res) => {
        this.aiResponse = res.reply;
        this.aiLoading = false;
        this.aiForm.patchValue({ query: '' });
      },
      error: () => {
        this.aiError = 'AI assistant is temporarily unavailable. Please try again shortly.';
        this.aiLoading = false;
      }
    });
  }
}
