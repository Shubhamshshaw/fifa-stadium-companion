import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, getIdTokenResult, User } from 'firebase/auth';
import { environment } from '../../../environments/environment';

export interface AppUser {
  uid: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private app: FirebaseApp;
  private auth = getAuth(this.initializeFirebaseApp());

  constructor() {}

  private initializeFirebaseApp(): FirebaseApp {
    if (getApps().length > 0) {
      return getApps()[0];
    }

    return initializeApp(environment.firebaseConfig);
  }

  signIn(email: string, password: string): Observable<AppUser> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(async (credential) => await this.mapUser(credential.user))
    );
  }

  getCurrentUser(): Observable<AppUser | null> {
    return new Observable<AppUser | null>((observer) => {
      const unsubscribe = onAuthStateChanged(this.auth, async (user) => {
        observer.next(user ? await this.mapUser(user) : null);
      });
      return () => unsubscribe();
    });
  }

  private async mapUser(user: User): Promise<AppUser> {
    const idTokenResult = await getIdTokenResult(user);
    const role = (idTokenResult.claims['role'] as string) ?? 'fan';

    return {
      uid: user.uid,
      email: user.email ?? '',
      role,
    };
  }
}
