import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, forkJoin, switchMap } from 'rxjs';
import { MediaService } from './media.service';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password?: string;
  bio: string;
  location: string;
  website: string;
  profile_picture_id: string | null;
  cover_photo_id: string | null;
  profile_setup_done: boolean;
  created_at: string;
  updated_at: string;
  // Resolved URLs (populated by service)
  profile_picture_url?: string;
  cover_photo_url?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private mediaService: MediaService) {}

  /** Enrich user object with resolved media URLs */
  private enrichUser(user: User): Observable<User> {
    return forkJoin({
      avatar: this.mediaService.getMediaUrl(user.profile_picture_id),
      cover: this.mediaService.getMediaUrl(user.cover_photo_id)
    }).pipe(
      map(({ avatar, cover }) => ({
        ...user,
        profile_picture_url: avatar || `https://i.pravatar.cc/150?u=${user.username}`,
        cover_photo_url: cover || ''
      }))
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`).pipe(
      switchMap(user => this.enrichUser(user)),
      catchError(() => of(null as any))
    );
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User[]>(`${this.baseUrl}/users?username=${username}`).pipe(
      map(users => users[0]),
      switchMap(user => user ? this.enrichUser(user) : of(null as any)),
      catchError(() => of(null as any))
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`).pipe(
      switchMap(users =>
        users.length > 0
          ? forkJoin(users.map(u => this.enrichUser(u)))
          : of([])
      ),
      catchError(() => of([]))
    );
  }

  updateUser(id: string, data: Partial<User>): Observable<User> {
    const payload = { ...data, updated_at: new Date().toISOString() };
    return this.http.patch<User>(`${this.baseUrl}/users/${id}`, payload).pipe(
      switchMap(user => this.enrichUser(user)),
      catchError(() => of(null as any))
    );
  }

  searchUsers(query: string): Observable<User[]> {
    return this.getAllUsers().pipe(
      map(users => {
        const q = query.toLowerCase();
        return users.filter(u =>
          u.username.toLowerCase().includes(q) ||
          u.first_name.toLowerCase().includes(q) ||
          u.last_name.toLowerCase().includes(q) ||
          (u.bio || '').toLowerCase().includes(q)
        );
      }),
      catchError(() => of([]))
    );
  }
}
