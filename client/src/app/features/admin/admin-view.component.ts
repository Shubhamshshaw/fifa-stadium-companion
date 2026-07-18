import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StadiumService } from '../../core/services/stadium.service';

@Component({
  selector: 'app-admin-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <h2>🏛️ Operations Command Centre</h2>

      <!-- Stadium selector -->
      <div class="card selector-card">
        <h3>Select Stadium</h3>
        <p *ngIf="stadiums.length === 0" class="loading-text">Loading stadiums…</p>
        <select *ngIf="stadiums.length > 0"
                (change)="selectStadium($any($event.target).value)"
                aria-label="Select stadium to manage"
                id="admin-stadium-select">
          <option *ngFor="let s of stadiums" [value]="s.id">{{ s.name }} — {{ s.city }}</option>
        </select>
      </div>

      <!-- Live Status Overview -->
      <div *ngIf="selectedStadium" class="card">
        <h3>📊 Live Status — {{ selectedStadium.name }}</h3>
        <div class="status-grid">
          <div class="status-tile">
            <span class="tile-label">Capacity</span>
            <span class="tile-value">{{ selectedStadium.capacity | number }}</span>
          </div>
          <div class="status-tile" *ngIf="crowdData">
            <span class="tile-label">Crowd Level</span>
            <span class="tile-value" [class]="'crowd-' + crowdData.status">
              {{ crowdData.crowdLevel }}%
            </span>
          </div>
          <div class="status-tile" *ngIf="crowdData">
            <span class="tile-label">Status</span>
            <span class="tile-value">{{ crowdData.status | titlecase }}</span>
          </div>
          <div class="status-tile" *ngIf="crowdData">
            <span class="tile-label">Trend</span>
            <span class="tile-value">{{ crowdData.trend | titlecase }}</span>
          </div>
        </div>
        <p *ngIf="loadingCrowd" class="loading-text">Loading live data…</p>
      </div>

      <!-- AI Operational Report -->
      <div *ngIf="selectedStadium" class="card ai-card">
        <div class="ai-header">
          <h3>🤖 AI Venue Report <span class="powered-by">powered by Gemini</span></h3>
          <button class="report-btn" (click)="generateAiReport()" [disabled]="aiReportLoading" aria-label="Generate AI venue report">
            {{ aiReportLoading ? '⏳ Generating…' : '📋 Generate Report' }}
          </button>
        </div>
        <div *ngIf="aiReport" class="ai-report-box" aria-live="polite">
          <span class="ai-icon">🤖</span>
          <p>{{ aiReport }}</p>
        </div>
        <div *ngIf="aiReportLoading" class="ai-loading">Gemini is generating your venue report…</div>
        <p *ngIf="aiReportError" class="error-text" role="alert">{{ aiReportError }}</p>
      </div>

      <!-- Sustainability Metrics -->
      <div *ngIf="selectedStadium" class="card">
        <h3>🌱 Sustainability Metrics</h3>
        <p *ngIf="loadingSustainability" class="loading-text">Loading metrics…</p>
        <div *ngIf="sustainabilityData && !loadingSustainability" class="metrics-grid">
          <div class="metric-item">
            <span class="metric-icon">♻️</span>
            <div>
              <div class="metric-label">Waste Reduction</div>
              <div class="metric-value">{{ sustainabilityData.wasteReductionPct }}%</div>
              <div class="metric-bar-bg">
                <div class="metric-bar waste" [style.width.%]="sustainabilityData.wasteReductionPct"></div>
              </div>
            </div>
          </div>
          <div class="metric-item">
            <span class="metric-icon">⚡</span>
            <div>
              <div class="metric-label">Energy Savings</div>
              <div class="metric-value">{{ sustainabilityData.energySavingsPct }}%</div>
              <div class="metric-bar-bg">
                <div class="metric-bar energy" [style.width.%]="sustainabilityData.energySavingsPct"></div>
              </div>
            </div>
          </div>
          <div class="metric-item">
            <span class="metric-icon">💧</span>
            <div>
              <div class="metric-label">Water Savings</div>
              <div class="metric-value">{{ sustainabilityData.waterSavingsPct }}%</div>
              <div class="metric-bar-bg">
                <div class="metric-bar water" [style.width.%]="sustainabilityData.waterSavingsPct"></div>
              </div>
            </div>
          </div>
          <div class="metric-item full">
            <span class="metric-icon">🕒</span>
            <div>
              <div class="metric-label">Last Updated</div>
              <div class="metric-value-sm">{{ sustainabilityData.measuredAt | date: 'dd MMM yyyy, HH:mm' }} UTC</div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Status -->
      <div class="card">
        <h3>🔐 System Access & Auth Status</h3>
        <div class="auth-status-grid">
          <div class="auth-item">
            <span class="status-dot green"></span>
            <div>
              <div class="auth-label">Firebase Auth</div>
              <div class="auth-sub">Emulator active on port 9099</div>
            </div>
          </div>
          <div class="auth-item">
            <span class="status-dot green"></span>
            <div>
              <div class="auth-label">Firestore</div>
              <div class="auth-sub">Emulator active on port 8080</div>
            </div>
          </div>
          <div class="auth-item">
            <span class="status-dot green"></span>
            <div>
              <div class="auth-label">Gemini AI</div>
              <div class="auth-sub">gemini-2.0-flash · API connected</div>
            </div>
          </div>
          <div class="auth-item">
            <span class="status-dot green"></span>
            <div>
              <div class="auth-label">.NET API</div>
              <div class="auth-sub">localhost:5134 · All endpoints live</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { padding: 1rem; }
    h2 { color: #a78bfa; margin-bottom: 1rem; font-size: 1.4rem; }
    h3 { margin: 0 0 0.75rem; font-size: 1.05rem; color: #d8c8ff; }
    .card {
      background: rgba(10, 30, 60, 0.85);
      border: 1px solid rgba(167, 139, 250, 0.25);
      border-radius: 14px; padding: 1.25rem; margin: 0.75rem 0;
      backdrop-filter: blur(8px);
    }
    /* Selector */
    .selector-card select {
      width: 100%; padding: 0.6rem 0.8rem; border-radius: 8px;
      border: 1px solid rgba(167, 139, 250, 0.35);
      background: rgba(255,255,255,0.05); color: #f5f7ff; font-size: 0.9rem;
    }
    /* Status grid */
    .status-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px,1fr)); gap: 0.6rem; }
    .status-tile {
      background: rgba(167,139,250,0.08); border: 1px solid rgba(167,139,250,0.2);
      border-radius: 10px; padding: 0.7rem 0.9rem; display: flex; flex-direction: column; gap: 4px;
    }
    .tile-label { font-size: 0.7rem; color: #b8a0e8; text-transform: uppercase; letter-spacing: 0.05em; }
    .tile-value { font-size: 1.2rem; font-weight: 700; color: #e5d8ff; }
    .crowd-busy { color: #ff7a7a; }
    .crowd-steady { color: #ffd466; }
    .crowd-calm { color: #4dd98a; }
    /* AI */
    .ai-card { border-color: rgba(167, 139, 250, 0.4); }
    .ai-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
    .ai-header h3 { margin: 0; }
    .powered-by { font-size: 0.68rem; color: #a78bfa; font-weight: 400; margin-left: 6px; opacity: 0.8; }
    .report-btn {
      background: linear-gradient(135deg, #a78bfa, #7c3aed);
      color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 8px;
      cursor: pointer; font-weight: 700; font-size: 0.85rem; transition: opacity 0.2s;
    }
    .report-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .ai-report-box {
      display: flex; gap: 0.6rem; align-items: flex-start;
      background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.3);
      border-radius: 10px; padding: 0.75rem 1rem;
    }
    .ai-icon { font-size: 1.2rem; flex-shrink: 0; }
    .ai-report-box p { margin: 0; color: #e5d8ff; font-size: 0.9rem; line-height: 1.6; }
    .ai-loading { color: #a78bfa; font-size: 0.88rem; padding: 0.5rem 0; }
    /* Metrics */
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
    .metric-item { display: flex; gap: 0.75rem; align-items: flex-start; background: rgba(167,139,250,0.07); border-radius: 10px; padding: 0.8rem; }
    .metric-item.full { grid-column: 1 / -1; }
    .metric-icon { font-size: 1.5rem; flex-shrink: 0; }
    .metric-label { font-size: 0.72rem; color: #b8a0e8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
    .metric-value { font-size: 1.4rem; font-weight: 700; color: #e5d8ff; }
    .metric-value-sm { font-size: 0.9rem; font-weight: 500; color: #c8b8ff; }
    .metric-bar-bg { background: rgba(167,139,250,0.15); border-radius: 99px; height: 6px; margin-top: 6px; overflow: hidden; }
    .metric-bar { height: 100%; border-radius: 99px; transition: width 0.8s ease; }
    .waste  { background: linear-gradient(90deg, #4dd98a, #00d4aa); }
    .energy { background: linear-gradient(90deg, #ffd466, #ff9a00); }
    .water  { background: linear-gradient(90deg, #7ed0ff, #0090ff); }
    /* Auth status */
    .auth-status-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
    .auth-item { display: flex; gap: 0.6rem; align-items: center; background: rgba(167,139,250,0.06); border-radius: 8px; padding: 0.6rem 0.8rem; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .status-dot.green { background: #4dd98a; box-shadow: 0 0 6px #4dd98a; }
    .status-dot.red { background: #ff5a5a; box-shadow: 0 0 6px #ff5a5a; }
    .auth-label { font-size: 0.85rem; font-weight: 600; color: #e5d8ff; }
    .auth-sub { font-size: 0.72rem; color: #9ab8d8; }
    /* Shared */
    .loading-text { color: #9ab8d8; font-size: 0.85rem; }
    .error-text { color: #ff8a8a; font-size: 0.82rem; margin-top: 0.3rem; }
  `]
})
export class AdminViewComponent implements OnInit {
  stadiums: any[] = [];
  selectedStadium: any = null;
  sustainabilityData: any = null;
  loadingSustainability = false;
  crowdData: any = null;
  loadingCrowd = false;

  aiReport: string | null = null;
  aiReportLoading = false;
  aiReportError: string | null = null;

  constructor(private stadiumService: StadiumService) {}

  ngOnInit(): void {
    this.stadiumService.getStadiums().subscribe({
      next: (stadiums) => {
        this.stadiums = stadiums;
        if (stadiums.length > 0) this.selectStadium(stadiums[0].id);
      },
      error: () => {}
    });
  }

  selectStadium(stadiumId: string): void {
    const stadium = this.stadiums.find(s => s.id === stadiumId);
    if (!stadium) return;

    this.selectedStadium = stadium;
    this.sustainabilityData = null;
    this.crowdData = null;
    this.aiReport = null;
    this.aiReportError = null;

    this.loadingSustainability = true;
    this.stadiumService.getSustainability(stadiumId).subscribe({
      next: (data) => { this.sustainabilityData = data; this.loadingSustainability = false; },
      error: () => { this.loadingSustainability = false; }
    });

    this.loadingCrowd = true;
    this.stadiumService.getCrowdStatus(stadiumId).subscribe({
      next: (data) => { this.crowdData = data; this.loadingCrowd = false; },
      error: () => { this.loadingCrowd = false; }
    });
  }

  generateAiReport(): void {
    if (!this.selectedStadium) return;
    this.aiReportLoading = true;
    this.aiReport = null;
    this.aiReportError = null;

    const prompt = `You are a FIFA World Cup 2026 venue operations AI analyst.
Stadium: ${this.selectedStadium.name}, ${this.selectedStadium.city}
Capacity: ${this.selectedStadium.capacity}
${this.crowdData ? `Current crowd: ${this.crowdData.crowdLevel}% (${this.crowdData.status}, trend: ${this.crowdData.trend})` : ''}
${this.sustainabilityData ? `Sustainability — Waste reduction: ${this.sustainabilityData.wasteReductionPct}%, Energy savings: ${this.sustainabilityData.energySavingsPct}%, Water savings: ${this.sustainabilityData.waterSavingsPct}%` : ''}
Write a concise 3-sentence operational status report for this venue suitable for a tournament director. Include crowd situation, sustainability performance, and one key recommendation.`;

    this.stadiumService.queryAI(prompt, 'en').subscribe({
      next: (res: any) => { this.aiReport = res.reply; this.aiReportLoading = false; },
      error: () => { this.aiReportError = 'Report generation failed. Please try again.'; this.aiReportLoading = false; }
    });
  }
}
