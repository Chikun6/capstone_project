import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, forkJoin } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';

export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  profile_picture_id: string | null;
  cover_photo_id: string | null;
  profile_picture_url?: string;
  cover_photo_url?: string;
  profile_setup_done: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:3000';
  private SESSION_KEY = 'twitter_session_user';

  // Made public so profile-setup and profile components can directly push enriched user
  public currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem(this.SESSION_KEY);
    if (stored) {
      try { this.currentUserSubject.next(JSON.parse(stored)); }
      catch { localStorage.removeItem(this.SESSION_KEY); }
    }
  }

  get currentUser(): AuthUser | null { return this.currentUserSubject.value; }
  get isLoggedIn(): boolean { return !!this.currentUserSubject.value; }
  get currentUserId(): string | null { return this.currentUserSubject.value?.id ?? null; }

  /** Resolve a media ID to its URL */
  resolveMediaUrl(id: string | null | undefined): Observable<string> {
    if (!id) return of('');
    return this.http.get<any>(`${this.baseUrl}/media/${id}`).pipe(
      map(m => m?.media_url ?? ''),
      catchError(() => of(''))
    );
  }

  /** Fetch user from DB, resolve media URLs, store in session, push to subject */
  enrichAndStore(user: AuthUser): Observable<AuthUser> {
    return forkJoin({
      avatar: this.resolveMediaUrl(user.profile_picture_id),
      cover:  this.resolveMediaUrl(user.cover_photo_id)
    }).pipe(
      map(({ avatar, cover }) => ({
        ...user,
        profile_picture_url: avatar || '',
        cover_photo_url:     cover  || ''
      })),
      tap(enriched => {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(enriched));
        this.currentUserSubject.next(enriched);
      }),
      catchError(() => {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
        return of(user);
      })
    );
  }

  /** Store an already-enriched user (from external callers) */
  storeEnrichedUser(user: AuthUser): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  login(identifier: string, password: string): Observable<AuthUser> {
    return this.http.get<any[]>(`${this.baseUrl}/users?email=${encodeURIComponent(identifier)}`).pipe(
      switchMap(byEmail => {
        if (byEmail?.length > 0) return of(byEmail);
        return this.http.get<any[]>(`${this.baseUrl}/users?username=${encodeURIComponent(identifier)}`);
      }),
      map(users => {
        if (!users?.length) throw new Error('USER_NOT_FOUND');
        const user = users[0];
        if (user.password !== password) throw new Error('INVALID_PASSWORD');
        return user as AuthUser;
      }),
      switchMap(user => this.enrichAndStore(user)),
      catchError(err => throwError(() => err))
    );
  }

  register(data: { first_name: string; last_name: string; username: string; email: string; password: string }): Observable<AuthUser> {
    return this.http.get<any[]>(`${this.baseUrl}/users?email=${encodeURIComponent(data.email)}`).pipe(
      switchMap(byEmail => {
        if (byEmail?.length > 0) throw new Error('EMAIL_TAKEN');
        return this.http.get<any[]>(`${this.baseUrl}/users?username=${encodeURIComponent(data.username)}`);
      }),
      switchMap(byUsername => {
        if (byUsername?.length > 0) throw new Error('USERNAME_TAKEN');
        return this.http.post<AuthUser>(`${this.baseUrl}/users`, {
          first_name: data.first_name, last_name: data.last_name,
          username: data.username, email: data.email, password: data.password,
          bio: '', location: '', website: '',
          profile_picture_id: null, cover_photo_id: null,
          profile_setup_done: false,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        });
      }),
      // Don't store session — user must log in after registering
      catchError(err => throwError(() => err))
    );
  }

  markProfileSetupDone(): void {
    const user = this.currentUser;
    if (user) {
      const updated = { ...user, profile_setup_done: true };
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(updated));
      this.currentUserSubject.next(updated);
    }
  }

  refreshCurrentUser(): Observable<AuthUser> {
    const id = this.currentUserId;
    if (!id) return of(null as any);
    return this.http.get<AuthUser>(`${this.baseUrl}/users/${id}`).pipe(
      switchMap(user => this.enrichAndStore(user))
    );
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.currentUserSubject.next(null);
  }
}
