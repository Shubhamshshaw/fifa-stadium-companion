import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  signIn(email: string, password: string): Observable<{ uid: string; email: string; role: string }> {
    // Placeholder: In production, use Firebase Auth SDK
    return of({ uid: 'mock-user', email, role: 'fan' });
  }

  getCurrentUser(): Observable<{ uid: string; email: string; role: string } | null> {
    return of({ uid: 'mock-user', email: 'fan@example.com', role: 'fan' });
  }
}
