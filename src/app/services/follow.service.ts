import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

export interface Follow {
  id?: string;
  follower_id: string;
  following_id: string;
  followed_at?: string;
}

@Injectable({ providedIn: 'root' })
export class FollowService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getFollowing(userId: string): Observable<Follow[]> {
    return this.http.get<Follow[]>(`${this.baseUrl}/follow?follower_id=${userId}`).pipe(
      catchError(() => of([]))
    );
  }

  getFollowers(userId: string): Observable<Follow[]> {
    return this.http.get<Follow[]>(`${this.baseUrl}/follow?following_id=${userId}`).pipe(
      catchError(() => of([]))
    );
  }

  isFollowing(followerId: string, followingId: string): Observable<boolean> {
    return this.http.get<Follow[]>(
      `${this.baseUrl}/follow?follower_id=${followerId}&following_id=${followingId}`
    ).pipe(
      map(results => results.length > 0),
      catchError(() => of(false))
    );
  }

  follow(followerId: string, followingId: string): Observable<Follow> {
    const payload: Follow = {
      follower_id: followerId,
      following_id: followingId,
      followed_at: new Date().toISOString()
    };
    return this.http.post<Follow>(`${this.baseUrl}/follow`, payload).pipe(
      catchError(() => of(payload))
    );
  }

  unfollow(followerId: string, followingId: string): Observable<void> {
    return this.http.get<Follow[]>(
      `${this.baseUrl}/follow?follower_id=${followerId}&following_id=${followingId}`
    ).pipe(
      switchMap(results => {
        if (results.length > 0) {
          return this.http.delete<void>(`${this.baseUrl}/follow/${results[0].id}`);
        }
        return of(void 0);
      }),
      catchError(() => of(void 0))
    );
  }

  toggleFollow(followerId: string, followingId: string, currentlyFollowing: boolean): Observable<boolean> {
    if (currentlyFollowing) {
      return this.unfollow(followerId, followingId).pipe(map(() => false));
    } else {
      return this.follow(followerId, followingId).pipe(map(() => true));
    }
  }
}
