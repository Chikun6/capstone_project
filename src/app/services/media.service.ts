import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Media {
  id: string;
  user_id: string;
  tweet_id: string | null;
  media_name: string;
  media_type: string;
  media_url: string;
  purpose: 'profile_picture' | 'cover_photo' | 'tweet_media';
  uploaded_at: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getMediaById(id: string | null | undefined): Observable<Media | null> {
    if (!id) return of(null);
    return this.http.get<Media>(`${this.baseUrl}/media/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  getMediaUrl(id: string | null | undefined): Observable<string> {
    if (!id) return of('');
    return this.getMediaById(id).pipe(
      map(m => m?.media_url ?? ''),
      catchError(() => of(''))
    );
  }

  getMediaByTweetId(tweetId: string): Observable<Media[]> {
    return this.http.get<Media[]>(`${this.baseUrl}/media?tweet_id=${tweetId}`).pipe(
      catchError(() => of([]))
    );
  }

  getMediaByUserId(userId: string): Observable<Media[]> {
    return this.http.get<Media[]>(`${this.baseUrl}/media?user_id=${userId}&purpose=tweet_media`).pipe(
      catchError(() => of([]))
    );
  }

  /** Upload a media record (stores URL; in real app this would upload to S3/storage) */
  uploadMedia(payload: Omit<Media, 'id' | 'uploaded_at'>): Observable<Media> {
    const data = { ...payload, uploaded_at: new Date().toISOString() };
    return this.http.post<Media>(`${this.baseUrl}/media`, data).pipe(
      catchError(() => of(null as any))
    );
  }

  /** Delete a media record */
  deleteMedia(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/media/${id}`).pipe(
      catchError(() => of(void 0))
    );
  }
}
