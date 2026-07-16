import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <main class="shell">
      <header class="hero">
        <div>
          <p class="eyebrow">World Cup 2026</p>
          <h1>FIFA Stadium Companion</h1>
          <p class="summary">A smart stadium command center for fans, staff, and venue operators.</p>
        </div>
        <nav class="nav-links" aria-label="Primary">
          <a routerLink="/fan">Fan view</a>
          <a routerLink="/staff">Staff view</a>
          <a routerLink="/admin">Admin view</a>
        </nav>
      </header>

      <section class="panel">
        <router-outlet></router-outlet>
      </section>
    </main>
  `,
  styles: [
    `:host { display: block; min-height: 100vh; background: linear-gradient(135deg, #07152b, #132b4c); color: #f5f7ff; font-family: Inter, system-ui, sans-serif; }`,
    `.shell { max-width: 1120px; margin: 0 auto; padding: 2rem; }`,
    `.hero { display: flex; justify-content: space-between; align-items: start; gap: 1rem; margin-bottom: 1.5rem; }`,
    `.eyebrow { text-transform: uppercase; letter-spacing: 0.2em; color: #7ed0ff; font-size: 0.8rem; margin-bottom: 0.5rem; }`,
    `h1 { margin: 0 0 0.5rem; font-size: clamp(1.8rem, 3vw, 2.6rem); }`,
    `.summary { max-width: 640px; color: #dbe5ff; line-height: 1.5; }`,
    `.nav-links { display: flex; gap: 0.75rem; flex-wrap: wrap; }`,
    `.nav-links a { color: #07152b; background: #7ed0ff; padding: 0.65rem 0.95rem; border-radius: 999px; text-decoration: none; font-weight: 600; }`,
    `.panel { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.16); border-radius: 24px; padding: 1.25rem; backdrop-filter: blur(16px); }`
  ]
})
export class AppComponent {}
