import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem('bsky_user');
    if (stored) {
      this.currentUserSubject.next(JSON.parse(stored));
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  login(identifier: string, password: string): Observable<any> {
    // Simulate API call - replace with real Bluesky ATP API
    const mockUser: User = {
      did: 'did:plc:mock123',
      handle: identifier,
      displayName: identifier.split('@')[0],
      avatar: '',
      followersCount: 0,
      followsCount: 0,
      postsCount: 0
    };
    localStorage.setItem('bsky_user', JSON.stringify(mockUser));
    this.currentUserSubject.next(mockUser);
    return of({ success: true, user: mockUser });
  }

  register(email: string, password: string, birthDate: string): Observable<any> {
    const mockUser: User = {
      did: 'did:plc:new123',
      handle: email.split('@')[0],
      displayName: email.split('@')[0],
      avatar: '',
      followersCount: 0,
      followsCount: 0,
      postsCount: 0
    };
    localStorage.setItem('bsky_user', JSON.stringify(mockUser));
    this.currentUserSubject.next(mockUser);
    return of({ success: true, user: mockUser });
  }

  logout(): void {
    localStorage.removeItem('bsky_user');
    this.currentUserSubject.next(null);
  }
}
