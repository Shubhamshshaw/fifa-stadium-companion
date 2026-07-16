import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class StadiumService {
  private apiUrl = 'http://localhost:5134/api';

  constructor(private http: HttpClient) {}

  getStadiums(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stadiums`).pipe(
      catchError(() => of([
        { id: 'stadium-01', name: 'MetLife Stadium', city: 'New York', capacity: 82500 },
        { id: 'stadium-02', name: 'SoFi Stadium', city: 'Los Angeles', capacity: 70240 },
        { id: 'stadium-03', name: 'AT&T Stadium', city: 'Dallas', capacity: 80000 }
      ]))
    );
  }

  getStadiumById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stadiums/${id}`).pipe(
      catchError(() => of({ id, name: 'Sample Stadium', city: 'Sample City' }))
    );
  }

  getCrowdStatus(stadiumId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stadiums/${stadiumId}/crowd`).pipe(
      catchError(() => of({ stadiumId, crowdLevel: 72, status: 'steady' }))
    );
  }

  getMatches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/matches`).pipe(
      catchError(() => of([
        { id: 'm-001', title: 'Mexico vs. Argentina', homeTeam: 'Mexico', awayTeam: 'Argentina', scheduledTime: new Date().toISOString() }
      ]))
    );
  }

  queryAI(question: string, language: string = 'en'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ai/query`, { query: question, language }).pipe(
      catchError(() => of({ query: question, reply: `Response to: ${question}`, language }))
    );
  }

  createDispatch(stadiumId: string, actionType: string, description: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/dispatch`, { stadiumId, actionType, description }).pipe(
      catchError(() => of({ id: 'dispatch-' + Date.now(), stadiumId, actionType, description }))
    );
  }

  getSustainability(stadiumId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sustainability/${stadiumId}`).pipe(
      catchError(() => of({ stadiumId, wasteReductionPct: 24, energySavingsPct: 4.8, waterSavingsPct: 92 }))
    );
  }
}
