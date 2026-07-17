import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StadiumService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStadiums(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stadiums`).pipe(
      catchError((error) => {
        console.error('Failed to load stadiums', error);
        return throwError(() => error);
      })
    );
  }

  getStadiumById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stadiums/${id}`).pipe(
      catchError((error) => {
        console.error(`Failed to load stadium ${id}`, error);
        return throwError(() => error);
      })
    );
  }

  getCrowdStatus(stadiumId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stadiums/${stadiumId}/crowd`).pipe(
      catchError((error) => {
        console.error(`Failed to load crowd status for ${stadiumId}`, error);
        return throwError(() => error);
      })
    );
  }

  getMatches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/matches`).pipe(
      catchError((error) => {
        console.error('Failed to load matches', error);
        return throwError(() => error);
      })
    );
  }

  queryAI(question: string, language: string = 'en'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ai/query`, { query: question, language }).pipe(
      catchError((error) => {
        console.error('AI query failed', error);
        return throwError(() => error);
      })
    );
  }

  getLiveMatch(stadiumId?: string): Observable<any> {
    let params = new HttpParams();
    if (stadiumId) {
      params = params.set('stadiumId', stadiumId);
    }

    return this.http.get<any>(`${this.apiUrl}/matches/live`, { params }).pipe(
      catchError((error) => {
        console.error('Failed to load live match summary', error);
        return throwError(() => error);
      })
    );
  }

  createDispatch(stadiumId: string, actionType: string, description: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/dispatch`, { stadiumId, actionType, description }).pipe(
      catchError((error) => {
        console.error('Failed to create dispatch', error);
        return throwError(() => error);
      })
    );
  }

  getDispatches(stadiumId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dispatches/${stadiumId}`).pipe(
      catchError((error) => {
        console.error(`Failed to load dispatches for ${stadiumId}`, error);
        return throwError(() => error);
      })
    );
  }

  getSustainability(stadiumId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sustainability/${stadiumId}`).pipe(
      catchError((error) => {
        console.error(`Failed to load sustainability metrics for ${stadiumId}`, error);
        return throwError(() => error);
      })
    );
  }
}
